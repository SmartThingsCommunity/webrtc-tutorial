const { deviceState } = require('../utils')
const { getDevice } = require('../db')

/**
 * State refresh request. Respond with the current states of all devices. Called after
 * device discovery runs.
 * @accessToken External cloud access token
 * @response {StateRefreshResponse} StateRefresh response object
 */
module.exports = async (accessToken, response, { devices }) => {
	for (const device of devices) {
		const data = await getDevice(device.externalDeviceId)
		const states = deviceState(data.healthStatus, data.motion)
		await response.addDevice(device.externalDeviceId, states)
	}
}
