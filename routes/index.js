var express = require('express')
var router = express.Router()

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Unique Clan' })
})

router.get('/member', function (req, res, next) {
  res.render('member', {title: 'Members | Unique'})
})

router.get('/serverstatus', function (req, res, next) {
  res.redirect('/serverstatus/ger')
})

router.get('/serverstatus/ger', function (req, res, next) {
  res.render('svstatus/serverstatus_ger', {title: 'GER Server Status | Unique'})
})

router.get('/serverstatus/can', function (req, res, next) {
  res.render('svstatus/serverstatus_can', {title: 'CAN Server Status | Unique'})
})

router.get('/serverstatus/fra', function (req, res, next) {
  res.render('svstatus/serverstatus_fra', {title: 'FRA Server Status | Unique'})
})

router.get('/apply', function (req, res, next) {
  res.render('apply', {title: 'Apply | Unique'})
})

router.get('/mapupload', function (req, res, next) {
  res.render('mapupload', {title: 'Map upload | Unique'})
})

router.get('/ranks', function (req, res, next) {
  res.render('ranks', {title: 'Ranks | Unique'})
})

router.get('/points', function (req, res, next) {
  res.render('points', {title: 'Points | Unique'})
})

module.exports = router
