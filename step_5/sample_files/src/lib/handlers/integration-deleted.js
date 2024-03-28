const { deleteConnection } = require('../db')

/**
 * Called when the connector is removed from SmartThings. You may want clean up access
 * tokens and other data when that happend.
 * @accessToken External cloud access token
 */
module.exports = async (accessToken) => {
	await deleteConnection(accessToken)
}
