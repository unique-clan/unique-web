var express = require('express')
var router = express.Router()
var debug = require('debug')('uniqueweb:auth')
var mongoose = require('mongoose')

/* GET home page. */
router.get('/', function (req, res, next) {
  res.redirect('login')
})

router.get('/login', function (req, res, next) {
  res.render('login', {title: 'Login | Unique'})
})

router.get('/register', function (req, res, next) {
  res.render('register', {title: 'Register | Unique'})
})

router.post('/register', function (req, res, next) {
  let gameModes = []
  if (typeof (req.body.gameMode) === 'string') {
    gameModes = req.body.gameModes.split(',')
  }
  // debug(req.params)
  // debug(req.body)

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
      res.status(400).json(err)
      return
    }
    debug(`Account created with username '${req.body.username}' (${req.ip})`)
    res.status(201).json({
      msg: 'Account created succesfully. You can login <a href="/auth/login">here</a>'
    })
  })
})

module.exports = router
