require('dotenv').config()
const { v4: uuid } = require('uuid')
const randomstring = require('randomstring')
const db = require('better-sqlite3')('.data/camera.db')
db.pragma('journal_mode = WAL')

const { deviceId } = require('./utils')

module.exports.generateCode = async () => {
	return new Promise((resolve, reject) => {
		try {
			const code = randomstring.generate(32)
			db.prepare('INSERT INTO codes (code, expires) VALUES (?, ?)').run([
				code,
				Date.now() + (1000 * 60 * 15)
			])
			resolve(code)
		} catch (error) {
			console.error('Error generating code', error)
			reject(error)
		}
	})
}

module.exports.redeemCode = async (code) => {
	return new Promise((resolve, reject) => {
		try {
			const data = db.prepare('SELECT * FROM codes WHERE code = ?').get([code])
			if (data && data.expires > Date.now()) {
				const authorization = {
					accessToken: uuid(),
					refreshToken: uuid(),
					expires: Date.now() + (1000 * 60 * 60 * 24)
				}

				db.prepare('INSERT INTO tokens (accessToken, refreshToken, expires) VALUES (?, ?, ?)').run([
					authorization.accessToken,
					authorization.refreshToken,
					authorization.expires
				])
				db.prepare('DELETE FROM codes WHERE code = ?').run([code])

				resolve(authorization)
			} else {
				reject(new Error('Invalid code'))
			}
		} catch (error) {
			console.error('Error redeeming code', error)
			reject(error)
		}
	})
}

module.exports.refreshTokens = async (refreshToken) => {
	return new Promise((resolve, reject) => {
		try {
			const data = db.prepare('SELECT * FROM tokens WHERE refreshToken = ?').get([refreshToken])
			if (data) {
				const authorization = {
					accessToken: uuid(),
					refreshToken,
					expires: Date.now() + (1000 * 60 * 60 * 24)
				}
				db.prepare('UPDATE tokens SET accessToken = ?, expires = ? WHERE accessToken = ?').run([
					authorization.accessToken,
					authorization.expires,
					data.accessToken,
				])
				db.prepare('UPDATE connections SET accessToken = ? WHERE accessToken = ?').run([
					authorization.accessToken,
					data.accessToken,
				])
				resolve(authorization)
			} else {
				reject(new Error('Invalid refresh token'))
			}
		} catch (error) {
			console.error('Error refreshing tokens', error)
			reject(error)
		}
	})
}

module.exports.getTokens = async () => {
	return new Promise((resolve, reject) => {
		try {
			const tokens = db.prepare('SELECT * FROM tokens').all()
			resolve(tokens)
		} catch (error) {
			console.error('Error getting tokens', error)
			reject(error)
		}
	})
}

module.exports.createConnection = async (accessToken, callbackAuthentication, callbackUrls) => {
	return new Promise((resolve, reject) => {
		try {
			db.prepare('INSERT INTO connections (accessToken, stAccessToken, stRefreshToken, stExpiresIn, stExpires, stTokenCallbackUrl, stStateRefreshCallbackUrl) VALUES (?, ?, ?, ?, ?, ?, ?)').run([
				accessToken,
				callbackAuthentication.accessToken,
				callbackAuthentication.refreshToken,
				callbackAuthentication.expiresIn,
				Date.now() + (callbackAuthentication.expiresIn * 1000),
				callbackUrls.oauthToken,
				callbackUrls.stateCallback,
			])
			resolve()
		} catch (error) {
			console.error('Error creating connection', error)
			reject(error)
		}
	})
}

module.exports.refreshCallbackTokens = async (accessToken, callbackAuthentication) => {
	return new Promise((resolve, reject) => {
		try {
			db.prepare('UPDATE connections SET stAccessToken = ?, stRefreshToken = ?, stExpiresIn = ?, stExpires = ? WHERE accessToken = ?').run([
				callbackAuthentication.accessToken,
				callbackAuthentication.refreshToken,
				callbackAuthentication.expiresIn,
				Date.now() + (callbackAuthentication.expiresIn * 1000),
				accessToken,
			])
			resolve()
		} catch (error) {
			console.error('Error updating callback tokens', error)
			reject(error)
		}
	})
}


module.exports.getConnections = async () => {
	return new Promise((resolve, reject) => {
		try {
			const connections = db.prepare('SELECT * FROM connections').all()
			resolve(connections)
		} catch (error) {
			console.error('Error getting connections', error)
			reject(error)
		}
	})
}

module.exports.deleteConnection = async (accessToken) => {
	return new Promise((resolve, reject) => {
		try {
			db.prepare('DELETE FROM tokens WHERE accessToken = ?').run([accessToken])
			db.prepare('DELETE FROM connections WHERE accessToken = ?').run([accessToken])
			resolve()
		} catch (error) {
			console.error('Error deleting connection', error)
			reject(error)
		}
	})
}

module.exports.getDevice = async (externalId) => {
	return new Promise((resolve, reject) => {
		try {
			const device = db.prepare('SELECT * FROM devices WHERE externalId = ?').get([externalId])
			resolve(device)
		} catch (error) {
			console.error('Error getting device', error)
			reject(error)
		}
	})
}

module.exports.updateDeviceMotion = async (externalId, motion) => {
	return new Promise((resolve, reject) => {
		try {
			db.prepare('UPDATE devices SET motion = ? WHERE externalId = ?').run([
				motion,
				externalId
			])
			resolve()
		} catch (error) {
			console.error('Error updating device motion', error)
			reject(error)
		}
	})
}

module.exports.updateDeviceHealth = async (externalId, healthStatus) => {
	return new Promise((resolve, reject) => {
		try {
			db.prepare('UPDATE devices SET healthStatus = ? WHERE externalId = ?').run([
				healthStatus,
				externalId
			])
			resolve()
		} catch (error) {
			console.error('Error updating device health', error)
			reject(error)
		}
	})
}

module.exports.updateDeviceAnswer = async (externalId, sdpAnswer) => {
	return new Promise((resolve, reject) => {
		try {
			db.prepare('UPDATE devices SET sdpAnswer = ? WHERE externalId = ?').run([
				sdpAnswer,
				externalId
			])
			resolve()
		} catch (error) {
			console.error('Error updating device answer', error)
			reject(error)
		}
	})
}

module.exports.getDevices = async () => {
	return new Promise((resolve, reject) => {
		try {
			const devices = db.prepare('SELECT * FROM devices').all()
			resolve(devices)
		} catch (error) {
			console.error('Error getting devices', error)
			reject(error)
		}
	})
}

module.exports.initialize = async () => {
	await createTables()
	const list = await this.getDevices()
	if (list.length === 0) {
		await addDevice(deviceId(), 'offline', '{}', 'inactive')
	}
}

const addDevice = async (externalId, online, sdpAnswer, motion) => {
	return new Promise((resolve, reject) => {
		try {
			db.prepare('INSERT INTO devices (externalId, healthStatus, sdpAnswer, motion) VALUES (?, ?, ?, ?)').run([
				externalId,
				online,
				sdpAnswer,
				motion
			])
			resolve()
		} catch (error) {
			console.error('Error adding device', error)
			reject(error)
		}
	})
}
const createTables = () => {
	return new Promise((resolve, reject) => {
		try {
			db.prepare(`CREATE TABLE IF NOT EXISTS codes (
        code TEXT PRIMARY KEY,
        expires INTEGER
      )`).run()

			db.prepare(`CREATE TABLE IF NOT EXISTS tokens (
        accessToken TEXT PRIMARY KEY,
        refreshToken TEXT,
        expires INTEGER
      )`).run()


			db.prepare(`CREATE TABLE IF NOT EXISTS connections (
        accessToken TEXT PRIMARY KEY,
        stAccessToken TEXT,
        stRefreshToken TEXT,
        stExpiresIn INTEGER,
        stExpires INTEGER,
        stTokenCallbackUrl TEXT,
        stStateRefreshCallbackUrl TEXT
      )`).run()

			db.prepare(`CREATE TABLE IF NOT EXISTS devices (
        externalId TEXT PRIMARY KEY,
        healthStatus TEXT,
        sdpAnswer TEXT,
        motion TEXT
      )`).run()
			resolve(db)
		} catch (error) {
			console.error('Error getting tokens', error)
			reject(error)
		}
	})
}
