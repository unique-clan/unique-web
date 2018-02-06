var express = require('express')
var router = express.Router()
var debug = require('debug')('uniqueweb:router')
var serverstatus = require('./serverstatus')

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
  res.redirect('/serverstatus/'+'GER')
})

router.get('/serverstatus/:location', function (req, res, next) {
  let location = req.params.location
  if (!(location in serverstatus.locations))
    res.sendStatus(404)
  res.render('serverstatus', {
    title: location + ' Server Status | Unique',
    user: req.session.authed ? req.session.user : null,
    locations: serverstatus.locations,
    location: location
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

module.exports = router
