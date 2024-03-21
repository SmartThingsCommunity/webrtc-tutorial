const path = require('path')
const createError = require('http-errors')
const express = require('express')
const session = require('express-session')
const winston = require('winston')
const expressWinston = require('express-winston')
const sqlite = require('better-sqlite3')
const indexRouter = require('./routes/index')
const oauthRouter = require('./routes/oauth')
const apiRouter = require('./routes/api')


const app = express()
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(expressWinston.logger({
	transports: [
		new winston.transports.Console(),
	],
	format: winston.format.combine(
		winston.format.colorize(),
		winston.format.simple(),
		// winston.format.prettyPrint(),
	),
}))

app.use(expressWinston.errorLogger({
	transports: [
		new winston.transports.Console(),
	],
	format: winston.format.combine(
		winston.format.colorize(),
		winston.format.simple(),
	),
}))

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, '../public')))

const SqliteStore = require('better-sqlite3-session-store')(session)
const db = new sqlite('.data/sessions.db')

app.use(session({
	store: new SqliteStore({
		client: db,
		expired: {
			clear: true,
			intervalMs: 900000 //ms = 15min
		}
	}),
	secret: 'oauth example secret',
	resave: false,
	saveUninitialized: true,
	cookie: { secure: false }
}))

app.use('/', indexRouter)
app.use('/oauth', oauthRouter)
app.use('/api', apiRouter)

// catch 404 and forward to error handler
app.use((req, res, next) => next(createError(404)))

// error handler
app.use((err, req, res) => {
	// set locals, only providing error in development
	res.locals.message = err.message
	res.locals.error = req.app.get('env') === 'development' ? err : {}

	// render the error page
	res.status(err.status || 500)
	res.render('error')
})

module.exports = app
