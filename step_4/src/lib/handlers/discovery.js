const { deviceId, deviceProfile } = require('../utils')

// The discovery handler is called after installation and every 6 hours after that.
module.exports = async (accessToken, response) => {
	const deviceName = process.env.DEVICE_NAME || 'Webcam Camera'
	const device = response.addDevice(deviceId(), deviceName, deviceProfile())
	device.manufacturerName('SmartThings Community')
	device.modelName('Webcam 1')
}
