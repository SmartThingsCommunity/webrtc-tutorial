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

You should wait some time until healthCheck is received and device become online. Then you can control all capabilities.

[Previous](../step_4/STEP_4.md)
