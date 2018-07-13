var express = require('express')
var router = express.Router()
var debug = require('debug')('uniqueweb:router')
var fs = require('fs')
var multer = require('multer')
var upload = multer({ dest: 'uploads/' })

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Unique Clan'
  })
})

router.get('/admin', function (req, res, next) {
  if (req.session && req.session.admin_authed) {
    return res.render('admin', {
      title: 'Unique Clan'
    })
  } else {
    res.redirect('/admin/login')
  }
})

router.get('/admin/login', function (req, res, next) {
  res.render('admin_login', {
    title: 'Admin login | Unique'
  })
})

router.post('/admin/login', function (req, res, next) {
  var pass = process.env.ADMIN_DASHBOARD_PW || '1234'

  if (req.body.adminpass === pass) {
    req.session.admin_authed = true
    return res.status(201).send()
  }
  return res.status(400).send()
})

module.exports = router
