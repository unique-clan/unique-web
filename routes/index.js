var express = require('express');
var router = express.Router();
var debug = require('debug')('uniqueweb:router');
var fs = require('fs');
var multer = require('multer');
var upload = multer({ dest: 'uploads/' });
const ServerStatus = require('../app/serverstatus');
const mongoose = require('mongoose');
const ApplicationModel = mongoose.model('Application');
const MapModel = mongoose.model('Map');

var serverStatus = new ServerStatus(process.env.SERVERS_LOCATION || 'servers.json');
serverStatus.startUpdating();

function getFilename (folder, name, ending) {
  let path = folder + '/' + name.replace(/[^\w]/g, '');
  if (!fs.existsSync(path + ending)) {
    return path + ending;
  } else {
    let n = 2;
    while (fs.existsSync(path + n + ending)) {
      n += 1;
    }
    return path + n + ending;
  }
}

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Unique Clan'
  });
});

router.get('/member', function (req, res, next) {
  res.render('member', {
    title: 'Members | Unique'
  });
});

router.get('/serverstatus', function (req, res, next) {
  res.redirect('/serverstatus/' + serverStatus.list.map(x => x.name)[0]);
});

router.get('/serverstatus/:location', function (req, res, next) {
  let serverName = String(req.params.location).toUpperCase();
  let serverNames = serverStatus.list.map(x => x.name);
  if (!serverNames.includes(serverName)) {
    return next();
  }
  res.render('serverstatus', {
    title: serverName + ' Server Status | Unique',
    user: req.session.authed ? req.session.user : null,
    locations: serverStatus.list,
    location: serverStatus.list.filter(x => x.name === serverName)[0]
  });
});

router.get('/apply', function (req, res, next) {
  res.render('apply', {
    title: 'Apply | Unique'
  });
});

router.post('/apply', async function (req, res, next) {
  try {
    if(req.body.gameModes && typeof req.body.gameModes === 'string') {
      req.body.gameModes = req.body.gameModes.split(',');
    }
    let App = new ApplicationModel(req.body);
    await App.save();
    res.status(201).json({ msg: 'Application sent.' });
  } catch(e) {
    debug(JSON.stringify(e));
    if(e.code === 11000) {
      return res.status(422).json({
        errors: {
          twName: {
            message:'Application with this name already found.'
          }
        }
      });
    }
    res.status(422).json(e);
  }
});

router.get('/submit', function (req, res, next) {
  res.render('mapupload', {
    title: 'Submit Map | Unique'
  });
});

router.post('/mapupload', upload.single('mapFile'), async function (req, res, next) {
  let errors = {};
  let errMessages = [];
  let error = false;

  if (req.body.mappers) {
    req.body.mappers = req.body.mappers.split(',').filter(g => g.length);
  }

  if(req.body.mappers.length < 1) {
    errors.mappers = {
      message: 'Mappers is required.'
    };
    error = true;
  }

  if(typeof req.file === 'undefined' || !req.file || !req.file.originalname) {
    errMessages.push('Missing file');
    error = true;
  }

  if (req.file && !req.file.originalname.endsWith('.map')) {
    errMessages.push('Filename must end on .map');
    error = true;
  }

  if (req.file && /[^\w]/g.test(req.file.originalname.replace(/\.map$/g, ''))) {
    errMessages.push('Invalid characters in map name, only allowed: a-Z 0-9 _');
    error = true;
  }

  // Max 8mb file size
  if(req.file && req.file.size > 8 * 1024 * 1024) {
    errMessages.push('Maximum file size is 8mb');
    error = true;
  }

  let mapFile = null;

  try {
    if(req.file)
      mapFile = fs.readFileSync(req.file.path);
  } catch(e) {
    errMessages.push('Error uploading the file, please retry.');
    error = true;
  }

  if(!mapFile && req.file) {
    errMessages.push('Error uploading the file, please retry.');
    error = true;
  }

  if(error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(422).json({ errors: errors, message: errMessages.join('<br>') });
  }

  try {
    await MapModel.create({
      fileName: req.file.originalname,
      mappers: req.body.mappers,
      mapFile: mapFile,
      encoding: req.file.encoding,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch(e) {
    fs.unlinkSync(req.file.path);
    return next(e);
  }

  fs.unlinkSync(req.file.path);
  return res.status(201).json({msg:'Map submission sent.'});
});

router.get('/tournaments', function (req, res, next) {
  res.render('tournaments', {
    title: 'Tournaments | Unique'
  });
});

router.get('/profile', function (req, res, next) {
  res.render('profile', {
    title: 'Profile | Unique'
  });
});
module.exports = router;
