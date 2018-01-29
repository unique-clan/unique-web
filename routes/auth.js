var express = require('express')
var router = express.Router()
var debug = require('debug')('uniqueweb:router')

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
  if (typeof (req.body.gameMode) === 'string') {
    req.body.gameMode = req.body.gameMode.split(',')
  }
  debug(req.params)
  debug(req.body)
  res.status(201).send()
})

module.exports = router
