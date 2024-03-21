const express = require('express')
const router = express.Router()
const { generateCode, redeemCode, refreshTokens } = require('../lib/db')

router.get('/login', async (req, res) => {
	res.render('oauth/login', {
		redirect_uri: req.query.redirect_uri,
		state: req.query.state,
		errorMessage: ''
	})
})

router.post('/authenticate', async (req, res) => {
	const { username, password, redirect_uri, state } = req.body
	if (username === process.env.APP_USERNAME && password === process.env.APP_PASSWORD) {
		const code = await generateCode()
		let location = `${redirect_uri}${redirect_uri.includes('?') ? '&' : '?'}code=${code}`
		if (state) {
			location += '&state=' + encodeURIComponent(state)
		}
		console.log('REDIRECTING TO', location)
		res.redirect(302, location)
	} else {
		res.render('oauth/login', {
			redirect_uri,
			state,
			errorMessage: 'Invalid username and password'
		})
	}
})

router.post('/token', async (req, res) => {
	try {
		console.log('TOKEN BODY', req.body)
		const { code, client_id, client_secret, grant_type, refresh_token } = req.body
		if (client_id !== process.env.CLIENT_ID || client_secret !== process.env.CLIENT_SECRET) {
			res.status(401).json({message: 'Invalid client credentials'})
			return
		}

		if (grant_type === 'authorization_code') {
			const tokens = await redeemCode(code)
			const body = {
				'access_token': tokens.accessToken,
				'refresh_token': tokens.refreshToken,
				'expires_in': 84600,
				'token_type': 'Bearer'
			}
			console.log('RESPONSE', body)
			res.send(body)
		} else if (grant_type === 'refresh_token') {
			const tokens = await refreshTokens(refresh_token)
			console.log('TOKENS', tokens)
			res.send({
				'access_token': tokens.accessToken,
				'refresh_token': tokens.refreshToken,
				'expires_in': 84600,
				'token_type': 'Bearer'
			})
		} else {
			res.status(401).json({message: 'Invalid grant type'})
		}
	} catch (error) {
		res.status(401).json({message: error.message})
	}
})

module.exports = router
