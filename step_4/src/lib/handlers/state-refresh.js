const { deviceState } = require('../utils')
const { getDevice } = require('../db')

module.exports = async (accessToken, response, { devices }) => {
	for (const device of devices) {
		const data = await getDevice(device.externalDeviceId)
		const states = deviceState(data.healthStatus, data.motion)
		await response.addDevice(device.externalDeviceId, states)
	}
}
