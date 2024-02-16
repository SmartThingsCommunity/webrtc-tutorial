const { createConnection } = require('../db')

module.exports = async (accessToken, callbackAuthentication, callbackUrls) => {
	console.log('CALLBACK ACCESS HANDLER')
	await createConnection(accessToken, callbackAuthentication, callbackUrls)
}
