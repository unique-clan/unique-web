var express = require('express')
var router = express.Router()
var debug = require('debug')('uniqueweb:ranks')
const mysql = require('mysql2/promise')

var mysqlOptions = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
}

function pad (n, width, z) {
  z = z || '0'
  n = n + ''
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n
}

function formatTime (time) {
  var ms = (time % 1).toFixed(3).substring(2)
  var minutes = Math.floor(time / 60)
  var seconds = Math.floor(time - minutes * 60)
  return `${pad(minutes, 2)}:${pad(seconds, 2)}.${pad(ms, 3)}`
}

function getMapRecordsQuery (type = 'Short') {
  return `SELECT @pos := @pos + 1 AS v1, @rank := IF(@prev = recordsCount, @rank, @pos) AS rank, @prev := recordsCount AS v2, Name, recordsCount FROM (SELECT Name, COUNT(*) as recordsCount FROM (SELECT Name, t1.Map as Map FROM (SELECT v1.Map, v1.Name, ROUND(v1.Time, 3) AS playerTime FROM race_race v1 INNER JOIN race_maps v2 ON v1.Map = v2.Map WHERE v2.Server = "${type}") t1 INNER JOIN (SELECT Map, ROUND(MIN(Time), 3) AS bestTime FROM race_race GROUP BY Map) t2 ON t1.Map = t2.Map AND t1.playerTime = t2.bestTime) u GROUP BY Name ORDER BY recordsCount DESC) v, (SELECT @pos := 0) i1, (SELECT @prev := -1) i2 LIMIT 10;`
}

router.get('/', async function (req, res, next) {
  const connection = await mysql.createConnection(mysqlOptions)

  const [mapRecords] = await connection.execute('SELECT @pos := @pos + 1 AS v1, @rank := IF(@prev = recordsCount, @rank, @pos) AS rank, @prev := recordsCount AS v2, Name, recordsCount FROM (SELECT Name, COUNT(*) as recordsCount FROM (SELECT Name, t1.Map as Map FROM (SELECT Map, Name, ROUND(Time, 3) AS playerTime FROM race_race) t1 INNER JOIN (SELECT Map, ROUND(MIN(Time), 3) AS bestTime FROM race_race GROUP BY Map) t2 ON t1.Map = t2.Map AND t1.playerTime = t2.bestTime) u GROUP BY Name ORDER BY recordsCount DESC) v, (SELECT @pos := 0) i1, (SELECT @prev := -1) i2 LIMIT 10;')

  const [topPoints] = await connection.execute('SELECT @pos := @pos + 1 AS v1, @rank := IF(@prev = Points, @rank, @pos) AS rank, @prev := Points AS v2, Name, Points FROM race_points, (SELECT @pos := 0) i1, (SELECT @prev := -1) i2 WHERE Points > 0 ORDER BY Points DESC LIMIT 10;')

  const [lastTopRanks] = await connection.execute('SELECT Map, Name, Timestamp, Time FROM race_lastrecords ORDER BY Timestamp DESC LIMIT 10;')

  const [mapRecordsShort] = await connection.execute(getMapRecordsQuery('Short'))
  const [mapRecordsMiddle] = await connection.execute(getMapRecordsQuery('Middle'))
  const [mapRecordsLong] = await connection.execute(getMapRecordsQuery('Long'))

  res.render('ranks', {
    title: 'Ranks | Unique',
    user: req.session.authed ? req.session.user : null,
    topPoints: topPoints,
    lastTopRanks: lastTopRanks,
    formatTime: formatTime,
    mapRecords: mapRecords,
    mapRecordsShort: mapRecordsShort,
    mapRecordsMiddle: mapRecordsMiddle,
    mapRecordsLong: mapRecordsLong
  })
})

router.get('/player/:name', async function (req, res, next) {
  var player = String(req.params.name)

  const connection = await mysql.createConnection(mysqlOptions)

  const [mapRecords] = await connection.execute('SELECT @pos := @pos + 1 AS v1, @rank := IF(@prev = recordsCount, @rank, @pos) AS rank, @prev := recordsCount AS v2, Name, recordsCount FROM (SELECT Name, COUNT(*) as recordsCount FROM (SELECT Name, t1.Map as Map FROM (SELECT Map, Name, ROUND(Time, 3) AS playerTime FROM race_race) t1 INNER JOIN (SELECT Map, ROUND(MIN(Time), 3) AS bestTime FROM race_race GROUP BY Map) t2 ON t1.Map = t2.Map AND t1.playerTime = t2.bestTime) u GROUP BY Name ORDER BY recordsCount DESC) v, (SELECT @pos := 0) i1, (SELECT @prev := -1) i2 WHERE Name=?;', [player])

  console.log(mapRecords)

  res.render('playerranks', {
    title: `Ranks for ${player} | Unique`,
    name: player,
    user: req.session.authed ? req.session.user : null,
    mapRecords: mapRecords.length > 0 ? mapRecords[0] : null
  })
})

module.exports = exports = router
