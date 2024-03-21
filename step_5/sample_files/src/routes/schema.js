const express = require('express')
const router = express.Router()
const connector = require('../lib/connector')

/**
 * ST Schema web-hook endpoint
 */
router.post('/', async function (req, res) {
	//console.log('SCHEMA:', req.body)
	await connector.handleHttpCallback(req, res)
})

module.exports = router
