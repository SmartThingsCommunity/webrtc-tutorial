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
