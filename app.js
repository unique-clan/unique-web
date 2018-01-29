var express = require('express')
var path = require('path')
var favicon = require('serve-favicon')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var stylus = require('stylus')
var debug = require('debug')('uniqueweb:app')

// Setup the db connection
const mongoose = require('mongoose')
// Load models
require('./mongodb/index')()

mongoose.Promise = global.Promise

var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function callback () {
  debug('Connection to database succesfull.')
})

// Build the connection string
var connectionString = 'mongodb://'

if (process.env.DATABASE_USERNAME && process.env.DATABASE_PASSWORD) {
  connectionString += `${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}`
}

if (process.env.DATABASE_HOST && process.env.DATABASE_PORT) {
  connectionString += `@${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}`
} else {
  connectionString += 'localhost'
}

connectionString += '/' + (process.env.DATABASE_NAME || 'uniqueweb')

mongoose.connect(connectionString, {
  useMongoClient: true
})

// Load App routes
var index = require('./routes/index')
var auth = require('./routes/auth')

var app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon/favicon.ico')))
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(stylus.middleware(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'public')))

// Add the app routes
app.use('/', index)
app.use('/auth', auth)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
