const { deviceId, deviceProfile } = require('../utils')

/**
 * Discovery request. Respond with a list of devices. Called after installation of the
 * connector and every six hours after that.
 * @accessToken External cloud access token
 * @response {DiscoveryResponse} Discovery response object
 */
module.exports = async (accessToken, response) => {
	const deviceName = process.env.DEVICE_NAME || 'Webcam Camera'
	const device = response.addDevice(deviceId(), deviceName, deviceProfile())
	device.manufacturerName('SmartThings Community')
	device.modelName('Webcam 1')
}
