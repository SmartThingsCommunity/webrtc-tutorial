const express = require('express')
const multer = require('multer')
const { v4: uuid } = require('uuid')
const fs = require('fs').promises
const router = express.Router()
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
	console.log('answer')
	res.json({})
})

router.post('/online', async function(req, res) {
	await updateDeviceHealth(deviceId(), req.body.value)
	if (req.body.value === 'offline') {
		console.log('webcam has gone offline')
	} else {
		console.log('webcam has come online')
	}
	res.json({})
})

router.post('/ring', async function(req, res) {
	console.log('doorbell rang')
	res.json({})
})

router.post('/motion', async function(req, res) {
	await updateDeviceMotion(deviceId(), req.body.value)
	if (req.body.value === 'active') {
		console.log('motion detected')
	} else {
		console.log('motion no longer detected')
	}
	res.json({})
})

router.post('/deviceIce', async function(req, res) {
	console.log('deviceIce')
	res.json({})
})

router.post('/capture', upload.single('image'), async function(req, res) {
	try {
		const id = uuid()
		const url = `${serverUrl()}/captures/${id}.jpg`

		await fs.writeFile(`public/captures/${id}.jpg`, req.file.buffer)

		console.log(`image ${id} captured`)

		res.json({url})
	} catch( error ) {
		console.error('Error saving image', error)
		res.status(500).send('Error saving image')
	}
})

module.exports = router
