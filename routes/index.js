var express = require('express')
var router = express.Router()
var debug = require('debug')('uniqueweb:router')
var fs = require('fs');
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })
const ServerStatus = require('../app/serverstatus')

var serverStatus = new ServerStatus(process.env.SERVERS_LOCATION || 'servers.json')
serverStatus.startUpdating()

function getFilename (folder, name, ending) {
  let path = folder + '/' + name.replace(/[^\w\s\.]/g, '')
  if (!fs.existsSync(path+ending)) {
    return path+ending
  } else {
    let n = 2
    while (true) {
      if (!fs.existsSync(path+n+ending))
        return path+n+ending
      n += 1
    }
  }
}

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
  if (!serverNames.includes(serverName)) {
    return next()
  }
  res.render('serverstatus', {
    title: serverName + ' Server Status | Unique',
    user: req.session.authed ? req.session.user : null,
    locations: serverStatus.list,
    location: serverStatus.list.filter(x => x.name === serverName)[0]
  })
})

router.get('/apply', function (req, res, next) {
  res.render('apply', {
    title: 'Apply | Unique',
    user: req.session.authed ? req.session.user : null
  })
})

router.post('/apply', function (req, res, next) {
  let errors = {}
  let error = false
  let application = {}
  const fields = ['twName', 'country', 'gameModes', 'gender', 'presentation']
  for (var i in fields) {
    let f = fields[i]
    let value = req.body[f]
    if (f === 'gameModes') {
      value = value.split(',').filter(g => g.length)
    }
    if (!value || !value.length) {
      errors[f] = { message: 'Field is required.' }
      error = true;
    }
    application[f] = value
  }
  if (error) {
    res.status(422).json({ errors: errors })
    return
  }
  let path = getFilename('admintmp/applications', req.body['twName'], '.json')
  fs.writeFileSync(path, JSON.stringify(application, null, 2))
  res.status(201).json({ msg: 'Application sent.' })
})

router.get('/mapupload', function (req, res, next) {
  res.render('mapupload', {
    title: 'Map Upload | Unique',
    user: req.session.authed ? req.session.user : null
  })
})

router.post('/mapupload', upload.single('mapFile'), function (req, res, next) {
  let errors = {}
  let error = false
  let mappers = []
  if (req.body.mappers) {
    mappers = req.body.mappers.split(',').filter(g => g.length)
  }
  if (!mappers.length) {
    errors.mappers = { message: 'Field is required.' }
    error = true
  }
  if (!req.file) {
    errors.mapFile = { message: 'File is required.' }
    error = true
  } else if (!req.file.originalname.endsWith('.map')) {
    errors.mapFile = { message: 'Filename must end on .map' }
    error = true
  }
  if (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path)
    }
    res.status(422).json({ errors: errors })
    return
  }
  let name = req.file.originalname.substring(0, req.file.originalname.length - 4)
  let path = getFilename('admintmp/map-submissions', name, '')
  fs.mkdirSync(path)
  fs.renameSync(req.file.path, getFilename(path, req.file.originalname, ''))
  let info = { filename: req.file.originalname, mappers: mappers }
  fs.writeFileSync(path+'/info.json', JSON.stringify(info, null, 2))
  res.status(201).json({ msg: 'Map submission sent.' })
})

router.get('/tournaments', function (req, res, next) {
  res.render('tournaments', {
    title: 'Tournaments | Unique',
    user: req.session.authed ? req.session.user : null
  })
})

router.get('/profile', function (req, res, next) {
  res.render('profile', {
    title: 'Profile | Unique',
    user: req.session.authed ? req.session.user : null
  })
})
module.exports = router
