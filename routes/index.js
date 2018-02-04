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

router.get('/serverstatus', function (req, res, next) {
  res.redirect('/serverstatus/ger')
})

router.get('/serverstatus/ger', function (req, res, next) {
  res.render('svstatus/serverstatus_ger', {
    title: 'GER Server Status | Unique',
    user: req.session.authed ? req.session.user : null
  })
})

router.get('/serverstatus/can', function (req, res, next) {
  res.render('svstatus/serverstatus_can', {
    title: 'CAN Server Status | Unique',
    user: req.session.authed ? req.session.user : null
  })
})

router.get('/serverstatus/fra', function (req, res, next) {
  res.render('svstatus/serverstatus_fra', {
    title: 'FRA Server Status | Unique',
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

router.get('/points', function (req, res, next) {
  res.render('points', {
    title: 'Points | Unique',
    user: req.session.authed ? req.session.user : null
  })
})

module.exports = router
