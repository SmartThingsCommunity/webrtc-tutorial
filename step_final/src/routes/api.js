const express = require('express')
const multer = require('multer')
const { v4: uuid } = require('uuid')
const fs = require('fs').promises
const router = express.Router()
const { proactiveCallback } = require('../lib/callbacks')
const { getDevice, updateDeviceMotion, updateDeviceHealth, updateDeviceAnswer } = require('../lib/db')
const { deviceId, serverUrl } = require('../lib/utils')

const storage = multer.memoryStorage() // Use memory storage for receiving files in memory
const upload = multer({ storage: storage })

async function authorizeSession(req, res, next) {
	const username = req.session.username
	if (username) {
		req.username = username
		next()
	} else {
		res.status(401).send('Unauthorized')
	}
}

router.use(authorizeSession)

router.get('/status', async function(req, res) {
	const device = await getDevice(deviceId())
	res.json(device)
})

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

router.post('/ring', async function(req, res) {
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

module.exports = router
