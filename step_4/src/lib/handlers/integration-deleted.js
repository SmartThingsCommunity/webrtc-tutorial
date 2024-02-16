const { deleteConnection } = require('../db')

module.exports = async (accessToken) => {
	await deleteConnection(accessToken)
}
