const express = require('express')
const router = express.Router()
const sse = require('../lib/sse')

/* GET home page. */
router.get('/', (req, res) => {
	if (req.session.username) {
		res.render('index', { errorMessage: '', invitationId: process.env.INVITATION_ID })
	} else {
		res.redirect('/login')
	}
})

router.get('/login', (req, res) => {
	res.render('login', { errorMessage: '' })
})

router.post('/authenticate', (req, res) => {
	// For this example, we only have one user whose username and password is specified.
	const { username, password } = req.body
	if (username === process.env.APP_USERNAME && password === process.env.APP_PASSWORD) {
		req.session.username = username
		res.redirect('/')
	} else {
		res.render('login', { errorMessage: 'Invalid username and password' })
	}
})

router.get('/logout', async (req, res) => {
	req.session.destroy(() => {
		res.redirect('/login')
	})
})

/**
 * Opens SSE stream for delivering SDP offers to the browser
 */
router.get('/stream', async (req, res, next) => {
	res.flush = () => { }
	next()
}, sse.init)


module.exports = router
