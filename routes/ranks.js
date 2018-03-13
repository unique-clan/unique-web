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

// https://stackoverflow.com/questions/13627308/add-st-nd-rd-and-th-ordinal-suffix-to-a-number#13627586
function getOrdinal (n) {
  var s = ['th', 'st', 'nd', 'rd']
  var v = n % 100
  return (s[(v - 20) % 10] || s[v] || s[0])
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
  return `SELECT @pos := @pos + 1 AS v1, @rank := IF(@prev = recordsCount, @rank, @pos) AS rank, @prev := recordsCount AS v2, Name, recordsCount FROM (SELECT Name, COUNT(*) as recordsCount FROM (SELECT Name, t1.Map as Map FROM (SELECT v1.Map, v1.Name, ROUND(v1.Time, 3) AS playerTime FROM race_race v1 INNER JOIN race_maps v2 ON v1.Map = v2.Map WHERE v2.Server = "${type}") t1 INNER JOIN (SELECT Map, ROUND(MIN(Time), 3) AS bestTime FROM race_race GROUP BY Map) t2 ON t1.Map = t2.Map AND t1.playerTime = t2.bestTime) u GROUP BY Name ORDER BY recordsCount DESC) v, (SELECT @pos := 0) i1, (SELECT @rank := -1) i2, (SELECT @prev := -1) i3;`
}

function getMapRecordsCategoryQuery (server = 'Short') {
  return `SELECT rank, recordsCount FROM (SELECT @pos := @pos + 1 AS v1, @rank := IF(@prev = recordsCount, @rank, @pos) AS rank, @prev := recordsCount AS v2, Name, recordsCount FROM (SELECT Name, COUNT(*) as recordsCount FROM (SELECT Name, t1.Map as Map FROM (SELECT v1.Map, v1.Name, ROUND(v1.Time, 3) AS playerTime FROM race_race v1 INNER JOIN race_maps v2 ON v1.Map = v2.Map WHERE v2.Server = "${server}") t1 INNER JOIN (SELECT Map, ROUND(MIN(Time), 3) AS bestTime FROM race_race GROUP BY Map) t2 ON t1.Map = t2.Map AND t1.playerTime = t2.bestTime) u GROUP BY Name ORDER BY recordsCount DESC) v, (SELECT @pos := 0) i1, (SELECT @rank := -1) i2, (SELECT @prev := -1) i3) w WHERE Name=?;`
}

router.get('/', async function (req, res, next) {
  const connection = await mysql.createConnection(mysqlOptions)

  const [mapRecords] = await connection.execute('SELECT @pos := @pos + 1 AS v1, @rank := IF(@prev = recordsCount, @rank, @pos) AS rank, @prev := recordsCount AS v2, Name, recordsCount FROM (SELECT Name, COUNT(*) as recordsCount FROM (SELECT Name, t1.Map as Map FROM (SELECT Map, Name, ROUND(Time, 3) AS playerTime FROM race_race) t1 INNER JOIN (SELECT Map, ROUND(MIN(Time), 3) AS bestTime FROM race_race GROUP BY Map) t2 ON t1.Map = t2.Map AND t1.playerTime = t2.bestTime) u GROUP BY Name ORDER BY recordsCount DESC) v, (SELECT @pos := 0) i1, (SELECT @rank := -1) i2, (SELECT @prev := -1) i3 LIMIT 10;')

  const [topPoints] = await connection.execute('SELECT @pos := @pos + 1 AS v1, @rank := IF(@prev = Points, @rank, @pos) AS rank, @prev := Points AS v2, Name, Points FROM race_points, (SELECT @pos := 0) i1, (SELECT @rank := -1) i2, (SELECT @prev := -1) i3 WHERE Points > 0 ORDER BY Points DESC LIMIT 10;')

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

  const [mapRecords] = await connection.execute('SELECT rank, recordsCount FROM (SELECT @pos := @pos + 1 AS v1, @rank := IF(@prev = recordsCount, @rank, @pos) AS rank, @prev := recordsCount AS v2, Name, recordsCount FROM (SELECT Name, COUNT(*) as recordsCount FROM (SELECT Name, t1.Map as Map FROM (SELECT Map, Name, ROUND(Time, 3) AS playerTime FROM race_race) t1 INNER JOIN (SELECT Map, ROUND(MIN(Time), 3) AS bestTime FROM race_race GROUP BY Map) t2 ON t1.Map = t2.Map AND t1.playerTime = t2.bestTime) u GROUP BY Name ORDER BY recordsCount DESC) v, (SELECT @pos := 0) i1, (SELECT @rank := -1) i2, (SELECT @prev := -1) i3) w WHERE Name=?;', [player])

  const [lastRecords] = await connection.execute(
    'SELECT Map, Name, Timestamp, Time FROM race_lastrecords WHERE Name=? ORDER BY Timestamp DESC LIMIT 10;', [player])

  const [playerPoints] = await connection.execute('SELECT rank, Points FROM (SELECT @pos := @pos + 1 AS v1, @rank := IF(@prev = Points, @rank, @pos) AS rank, @prev := Points AS v2, Name, Points FROM race_points, (SELECT @pos := 0) i1, (SELECT @rank := -1) i2, (SELECT @prev := -1) i3 WHERE Points > 0 ORDER BY Points DESC) t WHERE Name=?;', [player])

  const [totalMapCount] = await connection.execute(`SELECT COUNT(*) as n from race_maps`)
  const [shortMapCount] = await connection.execute(`SELECT COUNT(*) as n from race_maps where Server="Short"`)
  const [middleMapCount] = await connection.execute(`SELECT COUNT(*) as n from race_maps where Server="Middle"`)
  const [longMapCount] = await connection.execute(`SELECT COUNT(*) as n from race_maps where Server="Long"`)

  const [shortMapRecords] = await connection.execute(getMapRecordsCategoryQuery('Short'), [player])
  const [middleMapRecords] = await connection.execute(getMapRecordsCategoryQuery('Middle'), [player])
  const [longMapRecords] = await connection.execute(getMapRecordsCategoryQuery('Long'), [player])

  console.log(middleMapRecords)

  res.render('playerranks', {
    title: `Ranks for ${player} | Unique`,
    name: player,
    user: req.session.authed ? req.session.user : null,

    formatTime: formatTime,
    getOrdinal: getOrdinal,

    mapRecords: mapRecords.length > 0 ? mapRecords[0] : null,
    lastRecords: lastRecords,
    playerPoints: playerPoints.length > 0 ? playerPoints[0] : null,

    totalMapCount: totalMapCount.length > 0 ? totalMapCount[0].n : 'Unknown',
    numShortMaps: shortMapCount.length > 0 ? shortMapCount[0].n : 'Unknown',
    numMiddleMaps: middleMapCount.length > 0 ? middleMapCount[0].n : 'Unknown',
    numLongMaps: longMapCount.length > 0 ? longMapCount[0].n : 'Unknown',

    shortMapRecords: shortMapRecords.length > 0 ? shortMapRecords[0] : 'Unknown',
    middleMapRecords: middleMapRecords.length > 0 ? middleMapRecords[0] : 'Unknown',
    longMapRecords: longMapRecords.length > 0 ? longMapRecords[0] : 'Unknown'
  })
})

module.exports = exports = router
