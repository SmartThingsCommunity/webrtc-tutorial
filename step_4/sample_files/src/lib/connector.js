const { SchemaConnector } = require('st-schema')
const discoveryHandler = require('./handlers/discovery')
const stateRefreshHandler = require('./handlers/state-refresh')
const integrationDeletedHandler = require('./handlers/integration-deleted')
const callbackAccessHandler = require('./handlers/callback-access')

const connector = new SchemaConnector()
	.clientId(process.env.ST_CLIENT_ID)
	.clientSecret(process.env.ST_CLIENT_SECRET)
	.enableEventLogging(2)
	.callbackAccessHandler(callbackAccessHandler)
	.discoveryHandler(discoveryHandler)
	.stateRefreshHandler(stateRefreshHandler)
	.integrationDeletedHandler(integrationDeletedHandler)

module.exports = connector
