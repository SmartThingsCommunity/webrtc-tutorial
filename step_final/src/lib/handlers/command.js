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
