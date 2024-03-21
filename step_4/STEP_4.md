# Step 4: Create your Schema Connector and finish setup

## Install dependencies

Get started by navigating to your working directory and adding the `st-schema` npm package as a dependency:

	$ npm install st-schema

## Create your Schema Connector

Next, we need to create an instance of `SchemaConnector`. Create a new file named `connector.js`
in `src/lib` with the following code:

```js
const { SchemaConnector } = require('st-schema')

const connector = new SchemaConnector()
	.clientId(process.env.ST_CLIENT_ID)
	.clientSecret(process.env.ST_CLIENT_SECRET)
	.enableEventLogging(2)

module.exports = connector
```

## Set Up routing

Create a new file named `schema.js` in `src/routes`. This will handle requests from SmartThings using your
new connector.

```js
const express = require('express')
const router = express.Router()
const connector = require('../lib/connector')

/**
 * ST Schema web-hook endpoint
 */
router.post('/', async function (req, res) {
	//console.log('SCHEMA:', req.body)
	await connector.handleHttpCallback(req, res)
})

module.exports = router
```

Now, add the route to your `app.js` file:

```js
const schemaRouter = require('./routes/schema')

...

app.use('/schema', schemaRouter)
```

## Handlers

Create and register handlers with the Schema connector to handle important events from SmartThings.

### Discovery

Create a handler for discovery. This will get called when our application is installed.

Make a `handlers` directory in your `src/lib` directory and create a file called `discovery.js` with the following contents:

```js
const { deviceId, deviceProfile } = require('../utils')

// The discovery handler is called after installation and every 6 hours after that.
module.exports = async (accessToken, response) => {
	const deviceName = process.env.DEVICE_NAME || 'Webcam Camera'
	const device = response.addDevice(deviceId(), deviceName, deviceProfile())
	device.manufacturerName('SmartThings Community')
	device.modelName('Webcam 1')
}
```

### Callback Access

Create a handler for storing connection information. This will allow us to make API calls to SmartThings
when things happen locally; if the camera detects motion or the doorbell rings,
we can notify SmartThings.

Add a new file to your `src/lib/handlers` directory called `callback-access.js` with the following
contents:

```js
const { createConnection } = require('../db')

module.exports = async (accessToken, callbackAuthentication, callbackUrls) => {
	console.log('CALLBACK ACCESS HANDLER')
	await createConnection(accessToken, callbackAuthentication, callbackUrls)
}
```

> The `createConnection` method stores the connection information in our SQLite database.

### State Refresh

Sometimes, SmartThings will need to query your connector for the current state of devices.
To accomplish this, register a state handler that will respond with the current state. Create a
file called `state-refresh.js` in `src/lib/handlers` with the following contents:

```js
const { deviceState } = require('../utils')
const { getDevice } = require('../db')

module.exports = async (accessToken, response, { devices }) => {
	for (const device of devices) {
		// Look up device state information in our local database.
		const data = await getDevice(device.externalDeviceId)
		const states = deviceState(data.healthStatus, data.motion)
		// Add that state information to the response.
		await response.addDevice(device.externalDeviceId, states)
	}
}
```

### Integration Deleted

When an integration is deleted from a user's account, the connector is notified via an
"integration deletion handler". Create a file called `integration-deleted.js` to clean
up connection information in our local database for the user:

```js
const { deleteConnection } = require('../db')

module.exports = async (accessToken) => {
	await deleteConnection(accessToken)
}
```

### Register the Handlers

Update `src/lib/connector.js` to register these new handlers with your connector:

```js
const { SchemaConnector } = require('st-schema')
const discoveryHandler = require('./handlers/discovery')
const stateRefreshHandler = require('./handlers/state-refresh')
const integrationDeletedHandler = require('./handlers/integration-deleted')
const callbackAccessHandler = require('./handlers/callback-access')

const connector = new SchemaConnector()
	.clientId(process.env.ST_CLIENT_ID)
	.clientSecret(process.env.ST_CLIENT_SECRET)
	.enableEventLogging(2)
	.callbackAccessHandler(callbackAccessHandler)
	.discoveryHandler(discoveryHandler)
	.stateRefreshHandler(stateRefreshHandler)
	.integrationDeletedHandler(integrationDeletedHandler)

module.exports = connector
```

## Proactive Communication with SmartThings

When an event occurs on your device (such as a doorbell ringing), we need to update SmartThings. 
To accomplish this, first create a file called
`callbacks.js` in `src/lib` which will have a utility method making it easy to make an API call
to SmartThings:

```js
const { StateUpdateRequest } = require('st-schema')
const { getConnections, refreshCallbackTokens } = require('./db')
const { deviceId } = require('./utils')

module.exports.proactiveCallback = async (states) => {
	console.log('STATE CALLBACK', states)
	const stateUpdateRequest = new StateUpdateRequest(
		process.env.ST_CLIENT_ID,
		process.env.ST_CLIENT_SECRET
	)

	const deviceState = [
		{
			externalDeviceId: deviceId(),
			states
		}
	]

	const connections = await getConnections()
	for (const connection of connections) {
		try {
			const callbackUrls = {
				oauthToken: connection.stTokenCallbackUrl,
				stateCallback: connection.stStateRefreshCallbackUrl
			}

			const callbackAuth = {
				tokenType: 'Bearer',
				accessToken: connection.stAccessToken,
				refreshToken: connection.stRefreshToken,
				expiresIn: connection.expiresIn
			}

			await stateUpdateRequest.updateState(callbackUrls, callbackAuth, deviceState, refreshedAuth => {
				refreshCallbackTokens(connection.stAccessToken, refreshedAuth)
			})
		} catch(error) {
			console.log(`Error updating state: "${error}"`)
		}
	}
}
```

We can now use this in `src/routes/api.js` to notify SmartThings when the doorbell has been rung:

```js
const { proactiveCallback } = require('../lib/callbacks')

...

router.post('/ring', async function(req, res) {
	console.log('doorbell rang')
	await proactiveCallback([
		{
			capability: 'st.button',
			component: 'main',
			attribute: 'button',
			value: 'pushed',
			stateChange: 'Y'
		}
	])
	res.json({})
})
```

After making these updates, terminate any running instance of your OAuth app and restart: 

	$ npm start

## Install your Schema integration to your SmartThings account 

In order to install your new Schema integration to your SmartThings account, 
create an [invitation](https://developer.smartthings.com/docs/devices/cloud-connected/st-schema-invites). 
Creating an invitation for your Schema integration allows you to install it to your SmartThings account
without publishing it to the SmartThings catalog. To create an invitation, run the following command:

	$ smartthings invites:schema:create

Select your connector from the list that appears in the CLI and follow the prompts to create an invitation.
After creating your invitation, the CLI will provide you with an ID and URL for your invitation:

```json
{
    "invitationId": "f1b3a56-be7c-4a6a-9bab-d4133c69464f",
    "invitationUrl": "https://api.smartthings.com/invitation-web/accept?invitationId=f1b3a56-be7c-4a6a-9bab-d4133c69464f"
}
```

Paste the `invitationUrl` into a browser window and follow the prompts to install your integration.

Open the SmartThings app "Devices" tab and find the webcam device (named "Webcam Camera") created by 
your Schema integration. The device will be offline until the next step, but since we have implemented
the ring button, when you press "Ring Bell" in your browser, you should see a "Button pressed" event
appear in the details card for the device in the SmartThings app.

After installing your Schema integration to your SmartThings account, 
you are ready to proceed to [step 5](../step_5/STEP_5.md).
