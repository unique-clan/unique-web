var express = require('express')
var router = express.Router()
var debug = require('debug')('uniqueweb:router')
const ServerStatus = require('../app/serverstatus')

var serverStatus = new ServerStatus('servers.json')
serverStatus.startUpdating()

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
  res.redirect('/serverstatus/' + serverStatus.list.map(x => x.name)[0])
})

router.get('/serverstatus/:location', function (req, res, next) {
  let serverName = String(req.params.location).toUpperCase()
  let serverNames = serverStatus.list.map(x => x.name)
  debug(serverStatus.list.map(x => x.name))
  debug(serverName)
  debug(serverNames.includes(serverName))
  if (!serverNames.includes(serverName)) {
    return next()
  }
  res.render('serverstatus', {
    title: serverName + ' Server Status | Unique',
    user: req.session.authed ? req.session.user : null,
    server: serverStatus.list.filter(x => x.name === serverName)
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
