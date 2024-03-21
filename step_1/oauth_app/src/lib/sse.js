const SSE = require('express-sse')
const { updateDeviceHealth } = require('./db')
const { deviceId } = require('./utils')

let sse

module.exports.init = async (request, response, next) => {
	console.log('SSE stream setup')
	sse = new SSE()
	sse.init(request, response, next)

	await updateDeviceHealth(deviceId(), 'online')
	console.log('camera online')

	request.on('close', async () => {
		console.log('SSE stream closed')

		await updateDeviceHealth(deviceId(), 'offline')
		console.log('camera offline')
	})
}

module.exports.send = (data) => sse.send(data)
