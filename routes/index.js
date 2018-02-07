var express = require('express')
var router = express.Router()
var debug = require('debug')('uniqueweb:router')

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Unique Clan',
    user: req.session.authed ? req.session.user : null
  })
})

router.get('/member', function (req, res, next) {
  res.render('member', {
    title: 'Members | Unique',
    user: req.session.authed ? req.session.user : null
  })
})

router.get('/apply', function (req, res, next) {
  res.render('apply', {
    title: 'Apply | Unique',
    user: req.session.authed ? req.session.user : null
  })
})

router.get('/mapupload', function (req, res, next) {
  res.render('mapupload', {
    title: 'Map Upload | Unique',
    user: req.session.authed ? req.session.user : null
  })
})

router.get('/ranks', function (req, res, next) {
  res.render('ranks', {
    title: 'Ranks | Unique',
    user: req.session.authed ? req.session.user : null
  })
})

router.get('/tournaments', function (req, res, next) {
  res.render('tournaments', {
    title: 'Tournaments | Unique',
    user: req.session.authed ? req.session.user : null
  })
})

module.exports = router
require('./serverstatus')
