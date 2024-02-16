# Overview

:warning: DRAFT This tutorial is a rough first draft.

This tutorial will walk you through creating a SmartThings Schema which adds a web camera as a
device to your SmartThings account.

The application creates a single camera device that can be used to view the webcam's video stream
and integrate this video stream with SmartThings for viewing in the SmartThings app.

Individual steps in this tutorial can be found in `step_<n>` subdirectories. It is recommended
that you start with the simple OAuth 2.0 application provided in step 1 and proceed from there.

# Prerequisites

1. A [Samsung developer account](https://developer.smartthings.com/)
2. The [SmartThings CLI](https://github.com/SmartThingsCommunity/smartthings-cli/tree/main/packages/cli) installed and configured for your developer account
3. A webcam connected to your computer
4. NodeJS version 20.

# Tutorial

## Step 1 - A Simple OAuth 2.0 App

Your cloud must support OAuth 2.0 (including authorization code flow) so the first step is to have
an OAuth 2 application. For this tutorial, we are providing a simple Oauth 2.0 application in Step 1
which will stand in for your application. This is the starting point for this tutorial. Details of
how it works are beyond the scope of this tutorial.

This starter app stores data in a SQLite database in the `.data` directory.

### Get it Running

To run the connector, you will need to make it accessible to the Internet. We recommend using a program
like [ngrok](https://ngrok.com/) to do this, rather than opening ports to you computer in your router setup.

Start by cloning the repository below:

	git clone TODO:__repo__

Next, navigate to the project directory and install dependencies:

	cd webrtc-tutorial/step_1
	npm install

Start ngrok (or your preferred tunneling service) forwarding to port 3000 (the default port for the server).
If you are using ngrok, note the forwarding URL for use in the next step. (It will be an `https` URL.)

	# example using ngrok
	$ ngrok http 3000

Make up your own client id and secret to use in the example below. An online UUID-generator is a
good place to get values to use in this example. Make up a username and password for the single
sample user of this example app.

Create a `.env` file with the following variables, substituting your own values for each of them:

```
SERVER_URL=https://963f3b10c014.ngrok.app
CLIENT_ID=somerandomstring
CLIENT_SECRET=someotheroftenlongrandomstring
USERNAME=yourusername
PASSWORD=yourpassword
```

Start the server:

	npm start

### Kick the Tires (Test It Out)

Open the forwarding URL in your browser (we tested with Chrome) and sign in using the username
and password you specified in the `.env` file. There is no connection to SmartThings yet but
you can start the camera, simulate a doorbell ring, and simulate motion. You should see log
messages in the console when you take these actions.

## Step 2 - Create a Device Profile

We need a [device profile](https://developer.smartthings.com/docs/devices/device-profiles/) for our
camera devices we'll be creating.

You can use the CLI to create a device profile. First, we need to create a definition for the
device profile. You can find it under `step_02/deviceprofile.json`.

```json
{
	"name": "My WebRTC Camera",
	"metadata": {
		"vid": "03e80c0d-afc5-3c58-a66b-e796e4094946",
		"mnmn": "SmartThingsCommunity",
		"ocfDeviceType": "oic.d.camera",
		"stunServer": "stun.st-av.net"
	},
	"components": [
		{
			"label": "main",
			"id": "main",
			"capabilities": [
				{
					"id": "motionSensor",
					"version": 1,
					"ephemeral": false
				},
				{
					"id": "button",
					"version": 1,
					"ephemeral": false
				},
				{
					"id": "webrtc",
					"version": 1,
					"ephemeral": false
				},
				{
					"id": "imageCapture",
					"version": 1,
					"ephemeral": false
				},
				{
					"id": "healthCheck",
					"version": 1,
					"ephemeral": false
				}
			],
			"categories": [
				{
					"name": "Camera",
					"categoryType": "manufacturer"
				}
			]
		}
	]
}
```

Use the CLI to create the device profile using this JSON.

	$ cd step_2
	$ smartthings deviceprofiles:create -i deviceprofile.json

When you run this command, a device profile is created. Note the id of this device
profile for the next step.

```json
{
    "id": "a86c7dbb-4cc3-47b8-894b-d0715490d82a",
    "name": "My WebRTC Camera",
	...
}
```

Add the given device profile to your `.env` file:

```
DEVICE_PROFILE=a86c7dbb-4cc3-47b8-894b-d0715490d82a
```

Create an exported variable in `utils.js` with the device profile id. Replace the text
`DEVICE_PROFILE_ID_HERE` with the device profile id from the previous step.

```js
module.exports.deviceProfile = () => process.env.DEVICE_PROFILE
```

## Step 3 - Register Your Connector

Create a JSON file called `schema.json` with the following contents.

Make the following substitutions:

* your email address for `YOUR_EMAIL_HERE`
* `OAUTH_CLIENT_ID` with your OAuth client id (the `CLIENT_ID` in the `.env` file you created in step 1).
* `OAUTH_CLIENT_SECRET` with your OAuth client secret (`CLIENT_SECRET` in the `.env` file).
* replace all instances of `FORWARDING_URL` with your forwarding URL

```json
{
  "appName": "WebRTC Webcam Connector",
  "partnerName": "WebRTC Webcam Connector",
  "userEmail": "YOUR_EMAIL_HERE",
  "oAuthClientId": "OAUTH_CLIENT_ID",
  "oAuthClientSecret": "OAUTH_CLIENT_SECRET",
  "oAuthAuthorizationUrl": "FORWARDING_URL/oauth/login",
  "oAuthTokenUrl": "FORWARDING_URL/oauth/token",
  "oAuthScope": "read_devices write_devices",
  "hostingType": "webhook",
  "webhookUrl": "FORWARDING_URL/schema",
  "schemaType": "st-schema",
  "icon": "FORWARDING_URL/images/logo.png",
  "icon2x": "FORWARDING_URL/images/logo.png",
  "icon3x": "FORWARDING_URL/images/logo.png"
}
```

Then, use the CLI to register your schema connector:

	$ smartthings schema:create -i schema.json

This creates the record and returns a client id and secret for your app. The output of the command
should look like this:

```bash
{
    "endpointAppId": "viper_7f634cb0-b0d9-11ee-9eec-9165877943cd",
    "stClientId": "faab3a56-be7c-4a6a-9bab-d4133c69464f",
    "stClientSecret": "9df62b5707...60fa25c752bec989f25e0c1cc816e11fd0991ec"
}
```

Add the values for `CLIENT_ID` and `CLIENT_SECRET` from the output of the previous command
into the `.env` file.

```
ST_CLIENT_ID=faab3a56-be7c-4a6a-9bab-d4133c69464f
ST_CLIENT_SECRET=9df62b5707...60fa25c752bec989f25e0c1cc816e11fd0991ec
```

## Step 4 - Initial Schema Setup and Ring Button

Let's start out by implementing the simple "Ring" button.

### Install `st-schema` dependency.

Add the `st-schema` npm package as a dependency.

	$ npm install st-schema

### Create Schema Connector

Create an instance of `SchemaConnector`. Create a new file called `connector.js`
in `src/lib` with the following code:

```js
const { SchemaConnector } = require('st-schema')

const connector = new SchemaConnector()
	.clientId(process.env.ST_CLIENT_ID)
	.clientSecret(process.env.ST_CLIENT_SECRET)
	.enableEventLogging(2)

module.exports = connector
```

### Set Up Routing

Create a new file named `schema.js` in `src/routes` to handle requests from SmartThings using this
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

Now, add the route to `app.js`

```js
const schemaRouter = require('./routes/schema')

...

app.use('/schema', schemaRouter)
```

### Handlers

Create and register handlers with the Schema Connector to handle important events from SmartThings.

#### Discovery

Create a handler for discovery. This will get called when our application is installed. (We can
proactively add devices as well but we won't do that yet.)

Make a `handlers` directory in `src/lib` and create a file called `discovery.js` in it.

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

#### Callback Access

Create a handler for storing connection information. This will allow us to make APIs to SmartThings
when things happen locally. For example, if the camera detects motion or someone rings the doorbell,
we can notify SmartThings.

Add a new file to the `src/lib/handlers` directory called `callback-access.js` with the following
contents:

```js
const { createConnection } = require('../db')

module.exports = async (accessToken, callbackAuthentication, callbackUrls) => {
	console.log('CALLBACK ACCESS HANDLER')
	await createConnection(accessToken, callbackAuthentication, callbackUrls)
}
```

The `createConnection` method stores the connection information in our SQLite database. (TODO: maybe
we should include the code in `db.js` for managing connections here as well rather than including it
in step_1.)

#### State Refresh

Sometimes, SmartThings will need to query your connector for the current state of devices.
To do that, we'll register a state handler which will respond with the current state. Create a
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

#### Integration Deleted

When an integration is deleted from a users account, the connector will be notified via an
"integration deletion handler". Create a file called `integration-deleted.js` which will clean
up connection information in our local database for the user.

```js
const { deleteConnection } = require('../db')

module.exports = async (accessToken) => {
	await deleteConnection(accessToken)
}
```

#### Register the Handlers

Update `src/lib/connector.js` to register these new handlers with out connector:

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

### Proactive Communication with SmartThings

We need to update SmartThings when someone rings the doorbell. First, create a file called
`callbacks.js` in `src/lib` which will have a utility method making it easy to man an API call
to SmartThings.

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

After making these updates, restart the connector.

### Create an invitation for your connector using the CLI

Creating an invitation for your connector allows you to install it in your SmartThings account
without it being in the device catalog. To create an invitation, run the following command:

	$ smartthings invites:schema:create

Select your connector from the list that appears in the CLI and follow the prompts to create the invitation.
After creating your invitation, the CLI will provide you with an ID and URL for your invitation:

```json
{
    "invitationId": "f1b3a56-be7c-4a6a-9bab-d4133c69464f",
    "invitationUrl": "https://api.smartthings.com/invitation-web/accept?invitationId=f1b3a56-be7c-4a6a-9bab-d4133c69464f"
}
```

Paste the `invitationUrl` into a browser window and follow the prompts to install your connector.

Open the SmartThings app "Devices" tab and find the webcam device created by your Schema connector
(named "Webcam Camera"). The device will be offline until the next step but since we've implemented
the ring button, when you press "Ring Bell" in the browser, you should see a "Button pressed" event
appear in the details card for the device in the app.

## Final Step - Full Connector

To complete the connector, we are going to wire up the button to simulate motion and connect
the camera using webRTC.

### Motion Simulation

The web app already has a button to simulate motion. Wire this up to notify SmartThings when
motion is simulated. In `src/routes/api.js`, update the route for `POST /motion`:

```js
router.post('/motion', async function(req, res) {
	await updateDeviceMotion(deviceId(), req.body.value)
	await proactiveCallback([
		{
			capability: 'st.motionSensor',
			component: 'main',
			attribute: 'motion',
			value: req.body.value
		}
	])
	res.json({})
})
```

### Video Handling

#### Notify SmartThings

In `src/routes/api.js`, update the router for `POST /online` to notify SmartThings of the webcam's
status:

```js
router.post('/online', async function(req, res) {
	await updateDeviceHealth(deviceId(), req.body.value)
	await proactiveCallback([
		{
			capability: 'st.healthCheck',
			component: 'main',
			attribute: 'healthStatus',
			value: req.body.value
		}
	])
	res.json({})
})
```

Also, in `src/routes/api.js`, update the `POST /deviceIce` route:

```js
router.post('/deviceIce', async function(req, res) {
	await proactiveCallback([
		{
			capability: 'st.webrtc',
			component: 'main',
			attribute: 'deviceIce',
			value: {
				id: uuid(),
				ice: {
					candidate: req.body.candidate,
					sdpMid: req.body.sdpMid,
					sdpMLineIndex: req.body.sdpMLineIndex
				}
			}
		}
	])
	res.json({})
})
```

Update the `POST /capture` route to notify of image capture:

```js
router.post('/capture', upload.single('image'), async function(req, res) {
	try {
		const id = uuid()
		const url = `${serverUrl()}/captures/${id}.jpg`

		await fs.writeFile(`public/captures/${id}.jpg`, req.file.buffer)

		await proactiveCallback([
			{
				capability: 'st.imageCapture',
				component: 'main',
				attribute: 'image',
				value: url
			},
			{
				capability: 'st.imageCapture',
				component: 'main',
				attribute: 'encrypted',
				value: false
			},
			{
				capability: 'st.imageCapture',
				component: 'main',
				attribute: 'captureTime',
				value: new Date().toISOString()
			}
		])

		res.json({url})
	} catch( error ) {
		console.error('Error saving image', error)
		res.status(500).send('Error saving image')
	}
})
```

#### Command Handler

Create a new file called `command.js` `in src/lib/handlers` to handle commands initiated from
SmartThings:

```js
const sse = require('../sse')
const { updateDeviceAnswer } = require('../db')

module.exports = async (accessToken, response, devices) => {
	for (const device of devices) {
		for (const command of device.commands) {
			if (command.command === 'sdpOffer' || command.command === 'clientIce' || command.command === 'take') {
				sse.send(command)
			} else if (command.command === 'end') {
				const answer = {id: command.arguments[0], sdp: ''}
				const state = {
					component: 'main',
					capability: 'st.webrtc',
					attribute: 'sdpAnswer',
					value: answer
				}
				response.addDevice(device.externalDeviceId, [state], device.deviceCookie)
				await updateDeviceAnswer(device.externalDeviceId, JSON.stringify(answer))
			} else {
				console.warn('Unknown command', command)
			}
		}
	}
}
```

Add it to the connector defined in `connector.js`:

```js
const commandHandler = require('./handlers/command')

...

const connector = new SchemaConnector()
	...
	.commandHandler(commandHandler)
```

#### Event Stream

Uncomment code that opens sets up event stream in `startWebCam` in `public/javascripts/webcam.js`.

```js
	const eventSource = new EventSource('/stream')
	eventSource.onmessage = async (e) => {
		const cmd = JSON.parse(e.data)
		if (cmd.command === 'sdpOffer') {
			await processOffer(cmd.arguments)
		} else if (cmd.command === 'clientIce') {
			const candidate = cmd.arguments[1]
			console.log('CLIENT CANDIDATE =', JSON.stringify(candidate, null, 2))
			await pc.addIceCandidate(new RTCIceCandidate(candidate))
		} else if (cmd.command === 'take') {
			await captureImage()
		}
	}

	eventSource.onerror = (e) => console.log('EventSource failed %j', e)
```

In `src/routes/api.js`, notify SmartThings of webrtc answer:

```js
router.post('/answer', async function(req, res) {
	const answer = {
		id: req.body.id,
		sdp: req.body.sdp
	}

	await updateDeviceAnswer(deviceId(), JSON.stringify(answer))
	await proactiveCallback([
		{
			capability: 'st.webrtc',
			component: 'main',
			attribute: 'sdpAnswer',
			value: answer
		}
	])
	res.json({})
})
```

#### SmartThings Notification

In `src/lib/sse.js`, use `proactiveCallback` to notify SmartThings of the webcam coming online
and going offline:

```js
const { proactiveCallback } = require('./callbacks')

...

module.exports.init = async (request, response, next) => {
	console.log('SSE stream setup')
	sse = new SSE()
	sse.init(request, response, next)

	await updateDeviceHealth(deviceId(), 'online')
	await proactiveCallback([
		{
			capability: 'st.healthCheck',
			component: 'main',
			attribute: 'healthStatus',
			value: 'online'
		}
	])

	request.on('close', async () => {
		console.log('SSE stream closed')

		await updateDeviceHealth(deviceId(), 'offline')
		await proactiveCallback([
			{
				capability: 'st.healthCheck',
				component: 'main',
				attribute: 'healthStatus',
				value: 'offline'
			}
		])
	})
}
```




# References

* [Get Started with Cloud Connected Devices](https://developer.smartthings.com/docs/devices/cloud-connected/get-started)
* [Get Started with SmartThings Schema](https://developer.smartthings.com/docs/devices/cloud-connected/st-schema)
* [Device Profiles](https://developer.smartthings.com/docs/devices/device-profiles/)
* [st-schema NodeJS library](https://github.com/SmartThingsCommunity/st-schema-nodejs)
