const fs = require('fs')
const path = require('path')
const dataDir = path.resolve('.data')
if (!fs.existsSync(dataDir)) {
	fs.mkdirSync(dataDir)
}

const app = require('./app')
const db = require('./lib/db')
const { serverUrl } = require('./lib/utils')

const port = process.env.PORT || 3000

if (!process.env.CLIENT_ID || process.env.CLIENT_ID === 'xxx') {
	console.log('Copy the following into your .env file, and fill in your own values:\n')
	console.log('CLIENT_ID=xxx')
	console.log('CLIENT_SECRET=xxx')
	console.log('USERNAME=something')
	console.log('PASSWORD=secret')
	// eslint-disable-next-line no-process-exit
	process.exit()
}

// Start up a web server to act as a simple OAuth server and handle SmartThings schema events.
app.listen(port, async () => {
	await db.initialize()
	console.log(`Listening on port ${port}\n`)

	console.log(`Home: ${serverUrl()}`)
})
