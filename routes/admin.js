var express = require('express');
var router = express.Router();
var debug = require('debug')('uniqueweb:router');
var fs = require('fs');
var multer = require('multer');
var upload = multer({ dest: 'uploads/' });
const mongoose = require('mongoose');
const ApplicationModel = mongoose.model('Application');

const isAuthed = (req, res, next) => {
  if (req.session && req.session.admin_authed) {
    next();
  } else {
    res.redirect('/admin/login');
  }
};

router.get('/', isAuthed, async function (req, res, next) {
  let apps = await ApplicationModel.find({}).sort({lastMod: -1}).exec();
  return res.render('admin', {
    title: 'Unique Clan',
    apps: apps
  });
});

router.get('/delete/:name', isAuthed, async function (req, res, next) {
  try {
    await ApplicationModel.deleteMany({twName: req.params.name});
    res.redirect('/admin');
  } catch(e) {
    next(e);
  }
});

router.get('/login', function (req, res, next) {
  res.render('admin_login', {
    title: 'Admin login | Unique'
  });
});

router.post('/login', function (req, res, next) {
  var pass = process.env.ADMIN_DASHBOARD_PW || '1234';

  if (req.body.adminpass === pass) {
    req.session.admin_authed = true;
    return res.status(201).send();
  }
  return res.status(400).send();
});

module.exports = router;
