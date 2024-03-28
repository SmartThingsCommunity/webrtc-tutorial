const { createConnection } = require('../db')

/**
 * Create access and refresh tokens to allow SmartThings to be informed of device state
 * changes as they happen. 
 * @accessToken External cloud access token
 * @callbackAuthentication ST access and refresh tokens for proactive state callbacks
 * @callbackUrls Callback and refresh token URLs
 */
module.exports = async (accessToken, callbackAuthentication, callbackUrls) => {
	console.log('CALLBACK ACCESS HANDLER')
	await createConnection(accessToken, callbackAuthentication, callbackUrls)
}
