var express = require('express');
var router = express.Router();
var debug = require('debug')('uniqueweb:router');
var fs = require('fs');
var multer = require('multer');
var upload = multer({ dest: 'uploads/' });
var thumb = require('node-thumbnail').thumb;
var path = require('path');
const ServerStatus = require('../app/serverstatus');
const mongoose = require('mongoose');
const ApplicationModel = mongoose.model('Application');
const MapModel = mongoose.model('Map');
const sql = require('../app/sql');

var serverStatus = new ServerStatus();
serverStatus.startUpdating();

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

router.get('/maps', async function (req, res, next) {
  const connection = await sql.newMysqlConn();
  const mapCount = await sql.getCacheOrUpdate('mapOverviewCount', connection, 'SELECT COUNT(*) as Count FROM race_maps;');
  const pageCount = Math.ceil(mapCount[0]['Count'] / 30);
  const page = Math.min(Math.max(1, req.query.page), pageCount) || 1;
  const maps = await sql.getCacheOrUpdate('mapOverviewPage_' + page, connection, 'SELECT Map, Mapper, Timestamp FROM race_maps ORDER BY Timestamp DESC, LOWER(Map) LIMIT ?, 30;', [(page-1)*30]);
  connection.end();
  if (process.env.MAPS_LOCATION) {
    for (let i = 0; i < maps.length; i++) {
      try {
        await thumb({
          source: path.join(process.env.MAPS_LOCATION, maps[i].Map+'.png'),
          destination: path.join(__dirname, '../public/img/mapthumb'),
          width: 720,
          skip: true,
          suffix: '',
          quiet: true
        });
      } catch(e) { }
    }
  }
  res.render('maps', {
    title: 'Maps | Unique',
    page: page,
    pageCount: pageCount,
    maps: maps
  });
});

router.get('/map/:map', async function (req, res, next) {
  const connection = await sql.newMysqlConn();
  const [map] = await connection.execute('SELECT Map, Server, Mapper, Stars, Timestamp, (SELECT COUNT(DISTINCT Name) FROM race_race WHERE Map = l.Map) AS Finishers FROM race_maps l WHERE Map = ?;', [req.params.map]);
  if (!map.length) {
    res.render('maps', {
      title: 'Maps | Unique',
      mapname: req.params.map
    });
    connection.end();
    return;
  }
  const topTen = await sql.getCacheOrUpdate('mapOverviewTopTen_' + req.params.map, connection, 'SELECT @pos := @pos + 1 AS v1, @rank := IF(@prev = Time, @rank, @pos) AS rank, @prev := Time AS v2, Name, Time FROM (SELECT Name, MIN(Time) AS Time FROM race_race WHERE Map=? GROUP BY Name ORDER BY Time) v, (SELECT @pos := 0) i1, (SELECT @rank := -1) i2, (SELECT @prev := -1) i3 LIMIT 10;', [req.params.map]);
  const lastRecords = await sql.getCacheOrUpdate('mapOverviewLastRecords_' + req.params.map, connection, 'SELECT Name, Timestamp, Time FROM race_lastrecords WHERE Map=? ORDER BY Timestamp DESC LIMIT 10;', [req.params.map]);
  connection.end();
  res.render('map', {
    title: req.params.map + ' | Unique',
    map: map[0],
    topTen: topTen,
    lastRecords: lastRecords,
    formatTime: sql.formatTime,
    getCategory: function (map) {
      if (map.Server !== 'Long')
        return map.Server;
      let difficulty;
      if (map.Stars === 0)
        difficulty = 'Easy';
      else if (map.Stars === 1)
        difficulty = 'Advanced';
      else if (map.Stars === 2)
        difficulty = 'Hard';
      return map.Server + ' ' + difficulty;
    }
  });
});

module.exports = router;
