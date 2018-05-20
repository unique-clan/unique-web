var express = require('express')
var router = express.Router()
var debug = require('debug')('uniqueweb:router-admin')
const middleware = require('./middleware')
const mongoose = require('mongoose')

router.get('/', middleware.isAdminAuthed, function (req, res, next) {
  return res.render('admin/index', {
    title: 'Admin Zone | Unique Clan'
  })
})

router.get('/applications', middleware.isAdminAuthed, function (req, res, next) {
  const Applications = mongoose.model('Application')
  Applications.find({}).sort({date: -1}).then(apps => {
    res.render('admin/applications', {
      title: 'Applications | Unique Clan',
      apps: apps
    })
  }).catch(err => {
    next(err)
  })
})

router.get('/maps', middleware.isAdminAuthed, function (req, res, next) {
  return res.render('admin/maps', {
    title: 'Maps | Unique Clan'
  })
})

router.get('/login', function (req, res, next) {
  res.render('admin/login', {
    title: 'Admin login | Unique'
  })
})

router.get('/logout', function (req, res, next) {
  req.session.admin_authed = false
  res.redirect('/')
})

router.post('/login', function (req, res, next) {
  var pass = process.env.ADMIN_DASHBOARD_PW || "1234"

  if (req.body.adminpass === pass) {
    req.session.admin_authed = true
    return res.status(201).send()
  }
  return res.status(400).send()
})

module.exports = router
