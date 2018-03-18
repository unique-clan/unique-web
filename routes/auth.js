var express = require('express')
var router = express.Router()
var debug = require('debug')('uniqueweb:auth')
var maildebug = require('debug')('uniqueweb:mail')
var mongoose = require('mongoose')
var middleware = require('./middleware')
var Recaptcha = require('express-recaptcha')
const nodemailer = require('nodemailer')

let smtpConfig = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false, // upgrade later with STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
}

let transporter = nodemailer.createTransport(smtpConfig)

transporter.verify(function (error, success) {
  if (error) {
    maildebug(error)
  } else {
    maildebug('Server is ready to take our messages')
  }
})

var recaptcha = new Recaptcha(process.env.RECAPTCHA_SITE_KEY || '', process.env.RECAPTCHA_SECRET_KEY || '')

/* GET home page. */
router.get('/', function (req, res, next) {
  res.redirect('login')
})

router.get('/login', function (req, res, next) {
  res.render('login', {title: 'Login | Unique'})
})

router.get('/register', middleware.isNotAuthed, function (req, res, next) {
  res.render('register', {title: 'Register | Unique'})
})

router.get('/logout', function (req, res, next) {
  if (!req.session) {
    res.redirect('/')
    return
  }
  req.session.destroy(err => {
    if (err) {
      debug(err)
    }
    res.redirect('/')
  })
})

router.post('/login', function (req, res, next) {
  let response = {
    errors: {}
  }

  if (!req.body.username) {
    response.errors.username = {message: 'The username is missing'}
  }
  if (!req.body.password) {
    response.errors.password = {message: 'The password is missing'}
  }

  if (response.errors.length > 0) {
    res.status(400).json(response)
    return
  }

  let Users = mongoose.model('User')

  Users.getAuthenticated(req.body.username, req.body.password, (err, user, reason) => {
    if (err) throw err
    // login success if exists
    if (user) {
      debug(`${user.username} has logged in.`)
      if (!req.session) {
        req.session.regenerate()
      }
      req.session.regenerate((err) => {
        if (err) debug(err)
        req.session.authed = true
        req.session.user = {
          username: user.username,
          isAdmin: user.isAdmin,
          isTester: user.isTester,
          tw_name: user.tw_name,
          country: user.country
        }
        req.session.save(() => {
          res.status(200).json({ok: true})
        })
      })
    } else {
      var incorrect = {
        errors: {
          username: {
            message: 'Username or password incorrect.'
          },
          password: {
            message: 'Username or password incorrect.'
          }
        }
      }
      switch (reason) {
        case Users.failedLogin.NOT_FOUND:
        {
          res.status(400).json(incorrect)
          break
        }
        case Users.failedLogin.PASSWORD_INCORRECT:
        {
          res.status(400).json(incorrect)
          break
        }
        case Users.failedLogin.MAX_ATTEMPTS:
        {
          res.status(403).json({
            msg: 'To many login attempts, account locked for 2 hours.'
          })
          break
        }
      }
    }
  })
})

router.post('/register', function (req, res, next) {
  let gameModes = []
  if (typeof (req.body.gameMode) === 'string') {
    gameModes = req.body.gameModes.split(',')
  }
  // debug(req.params)
  // debug(req.body)

  recaptcha.verify(req, function (error, data) {
    if (!error) {
      let Users = mongoose.model('User')

      Users.create({
        username: req.body.username,
        tw_name: req.body.tw_name,
        password: req.body.password,
        gameModes: gameModes,
        country: req.body.country
      }, (err, result) => {
        if (err) {
          if (err.code && err.code === 11000) {
            debug(`${req.ip} tried to create account with an existing username '${req.body.username}'`)
            res.status(422).json({
              errors: {
                username: {
                  message: 'An account with this username already exists.'
                }
              }
            })
            return
          }
          debug(err)
          res.status(400).json({})
          return
        }
        debug(`Account created with username '${req.body.username}' (${req.ip})`)
        res.status(201).json({
          msg: 'Account created succesfully.'
        })
      })
    } else {
      console.log(req.body)
      res.status(422).json({
        errors: {
          'g-recaptcha-response': {
            message: 'reCaptcha is wrong.'
          }
        }
      })
    }
  })
})

module.exports = router
