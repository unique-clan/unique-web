var express = require('express')
var router = express.Router()
var debug = require('debug')('uniqueweb:ranks')
const mysql = require('mysql2/promise')

const forEach = require('p-iteration').forEach

const NodeCache = require('node-cache')

var cacheOptions = {}

if (process.env.TW_DB_CACHE_TIME) {
  cacheOptions.stdTTL = parseInt(process.env.TW_DB_CACHE_TIME)
} else {
  cacheOptions.stdTTL = 120
}

const dbCache = new NodeCache(cacheOptions)

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
  return `SELECT @pos := @pos + 1 AS v1, @rank := IF(@prev = recordsCount, @rank, @pos) AS rank, @prev := recordsCount AS v2, Name, recordsCount FROM (SELECT Name, COUNT(*) as recordsCount FROM (SELECT Name, t1.Map as Map FROM (SELECT v1.Map, v1.Name, ROUND(v1.Time, 3) AS playerTime FROM race_race v1 INNER JOIN race_maps v2 ON v1.Map = v2.Map WHERE v2.Server = "${type}") t1 INNER JOIN (SELECT Map, ROUND(MIN(Time), 3) AS bestTime FROM race_race GROUP BY Map) t2 ON t1.Map = t2.Map AND t1.playerTime = t2.bestTime) u GROUP BY Name ORDER BY recordsCount DESC) v, (SELECT @pos := 0) i1, (SELECT @rank := -1) i2, (SELECT @prev := -1) i3 LIMIT 10;`
}

function getMapRecordsCategoryQuery (server = 'Short') {
  return `SELECT rank, recordsCount FROM (SELECT @pos := @pos + 1 AS v1, @rank := IF(@prev = recordsCount, @rank, @pos) AS rank, @prev := recordsCount AS v2, Name, recordsCount FROM (SELECT Name, COUNT(*) as recordsCount FROM (SELECT Name, t1.Map as Map FROM (SELECT v1.Map, v1.Name, ROUND(v1.Time, 3) AS playerTime FROM race_race v1 INNER JOIN race_maps v2 ON v1.Map = v2.Map WHERE v2.Server = "${server}") t1 INNER JOIN (SELECT Map, ROUND(MIN(Time), 3) AS bestTime FROM race_race GROUP BY Map) t2 ON t1.Map = t2.Map AND t1.playerTime = t2.bestTime) u GROUP BY Name ORDER BY recordsCount DESC) v, (SELECT @pos := 0) i1, (SELECT @rank := -1) i2, (SELECT @prev := -1) i3) w WHERE Name=?;`
}

function getTopPointsCategory (server = 'Short') {
  return `SELECT @pos := @pos + 1 AS v1, @rank := IF(@prev = Points, @rank, @pos) AS rank, @prev := Points AS v2, Name, Points FROM race_catpoints, (SELECT @pos := 0) i1, (SELECT @rank := -1) i2, (SELECT @prev := -1) i3 WHERE Server="${server}" AND Points > 0 ORDER BY Points DESC LIMIT 10;`
}

function getMapListPlayerQuery (category) {
  return `SELECT t1.Map as Map, playerTime, FLOOR(100*EXP(-S*(playerTime/bestTime-1))) as mapPoints FROM (SELECT Map, ROUND(MIN(Time), 3) AS playerTime FROM race_race WHERE Name=? GROUP BY Map) t1 INNER JOIN (SELECT Map, ROUND(MIN(Time), 3) AS bestTime FROM race_race GROUP BY Map) t2 ON t1.Map = t2.Map INNER JOIN (SELECT Map, CASE WHEN Server="Short" THEN 5.0 WHEN Server="Middle" THEN 3.5 WHEN Server="Long" THEN CASE WHEN Stars=0 THEN 2.0 WHEN Stars=1 THEN 1.0 WHEN Stars=2 THEN 0.05 END END AS S FROM race_maps WHERE Server="${category}") t3 ON t1.Map = t3.Map;`
}

async function getCacheOrUpdate (key, connection, query, params = []) {
  const val = dbCache.get(key)

  if (val === undefined) {
    const [updatedValue] = await connection.execute(query, params)
    dbCache.set(key, updatedValue)
    return updatedValue
  } else {
    return val
  }
}

router.get('/', async function (req, res, next) {
  const connection = await mysql.createConnection(mysqlOptions)

  const mapRecords = await getCacheOrUpdate('mapRecords', connection, 'SELECT @pos := @pos + 1 AS v1, @rank := IF(@prev = recordsCount, @rank, @pos) AS rank, @prev := recordsCount AS v2, Name, recordsCount FROM (SELECT Name, COUNT(*) as recordsCount FROM (SELECT Name, t1.Map as Map FROM (SELECT Map, Name, ROUND(Time, 3) AS playerTime FROM race_race) t1 INNER JOIN (SELECT Map, ROUND(MIN(Time), 3) AS bestTime FROM race_race GROUP BY Map) t2 ON t1.Map = t2.Map AND t1.playerTime = t2.bestTime) u GROUP BY Name ORDER BY recordsCount DESC) v, (SELECT @pos := 0) i1, (SELECT @rank := -1) i2, (SELECT @prev := -1) i3 LIMIT 10;')

  const topPoints = await getCacheOrUpdate('topPoints', connection, 'SELECT @pos := @pos + 1 AS v1, @rank := IF(@prev = Points, @rank, @pos) AS rank, @prev := Points AS v2, Name, Points FROM race_points, (SELECT @pos := 0) i1, (SELECT @rank := -1) i2, (SELECT @prev := -1) i3 WHERE Points > 0 ORDER BY Points DESC LIMIT 10;')

  const topPointsShort = await getCacheOrUpdate('topPointsShort', connection, getTopPointsCategory('Short'))
  const topPointsMiddle = await getCacheOrUpdate('topPointsMiddle', connection, getTopPointsCategory('Middle'))
  const topPointsLong = await getCacheOrUpdate('topPointsLong', connection, getTopPointsCategory('Long'))

  const lastTopRanks = await getCacheOrUpdate('lastTopRanks', connection, 'SELECT Map, Name, Timestamp, Time FROM race_lastrecords ORDER BY Timestamp DESC LIMIT 10;')

  const mapRecordsShort = await getCacheOrUpdate('mapRecordsShort', connection, getMapRecordsQuery('Short'))
  const mapRecordsMiddle = await getCacheOrUpdate('mapRecordsMiddle', connection, getMapRecordsQuery('Middle'))
  const mapRecordsLong = await getCacheOrUpdate('mapRecordsLong', connection, getMapRecordsQuery('Long'))

  const totalMapCount = await getCacheOrUpdate('totalMapCount', connection, `SELECT COUNT(*) as n from race_maps`)
  const shortMapCount = await getCacheOrUpdate('shortMapCount', connection, `SELECT COUNT(*) as n from race_maps where Server="Short"`)
  const middleMapCount = await getCacheOrUpdate('middleMapCount', connection, `SELECT COUNT(*) as n from race_maps where Server="Middle"`)
  const longMapCount = await getCacheOrUpdate('longMapCount', connection, `SELECT COUNT(*) as n from race_maps where Server="Long"`)

  res.render('ranks', {
    title: 'Ranks | Unique',
    user: req.session.authed ? req.session.user : null,
    topPoints: topPoints,
    lastTopRanks: lastTopRanks,
    formatTime: formatTime,
    mapRecords: mapRecords,
    mapRecordsShort: mapRecordsShort,
    mapRecordsMiddle: mapRecordsMiddle,
    mapRecordsLong: mapRecordsLong,
    topPointsShort: topPointsShort,
    topPointsMiddle: topPointsMiddle,
    topPointsLong: topPointsLong,
    totalMapCount: totalMapCount.length > 0 ? totalMapCount[0].n : 'Unknown',
    numShortMaps: shortMapCount.length > 0 ? shortMapCount[0].n : 'Unknown',
    numMiddleMaps: middleMapCount.length > 0 ? middleMapCount[0].n : 'Unknown',
    numLongMaps: longMapCount.length > 0 ? longMapCount[0].n : 'Unknown',
  })
})

router.get('/player/:name', async function (req, res, next) {
  var player = String(req.params.name)

  const connection = await mysql.createConnection(mysqlOptions)

  const mapRecords = await getCacheOrUpdate('mapRecords_' + player, connection, 'SELECT rank, recordsCount FROM (SELECT @pos := @pos + 1 AS v1, @rank := IF(@prev = recordsCount, @rank, @pos) AS rank, @prev := recordsCount AS v2, Name, recordsCount FROM (SELECT Name, COUNT(*) as recordsCount FROM (SELECT Name, t1.Map as Map FROM (SELECT Map, Name, ROUND(Time, 3) AS playerTime FROM race_race) t1 INNER JOIN (SELECT Map, ROUND(MIN(Time), 3) AS bestTime FROM race_race GROUP BY Map) t2 ON t1.Map = t2.Map AND t1.playerTime = t2.bestTime) u GROUP BY Name ORDER BY recordsCount DESC) v, (SELECT @pos := 0) i1, (SELECT @rank := -1) i2, (SELECT @prev := -1) i3) w WHERE Name=?;', [player])

  const lastRecords = await getCacheOrUpdate('lastRecords_' + player, connection, 'SELECT Map, Name, Timestamp, Time FROM race_lastrecords WHERE Name=? ORDER BY Timestamp DESC LIMIT 10;', [player])

  const playerPoints = await getCacheOrUpdate('playerPoints_' + player, connection, 'SELECT rank, Points FROM (SELECT @pos := @pos + 1 AS v1, @rank := IF(@prev = Points, @rank, @pos) AS rank, @prev := Points AS v2, Name, Points FROM race_points, (SELECT @pos := 0) i1, (SELECT @rank := -1) i2, (SELECT @prev := -1) i3 WHERE Points > 0 ORDER BY Points DESC) t WHERE Name=?;', [player])

  const totalMapCount = await getCacheOrUpdate('totalMapCount', connection, `SELECT COUNT(*) as n from race_maps`)
  const shortMapCount = await getCacheOrUpdate('shortMapCount', connection, `SELECT COUNT(*) as n from race_maps where Server="Short"`)
  const middleMapCount = await getCacheOrUpdate('middleMapCount', connection, `SELECT COUNT(*) as n from race_maps where Server="Middle"`)
  const longMapCount = await getCacheOrUpdate('longMapCount', connection, `SELECT COUNT(*) as n from race_maps where Server="Long"`)

  const totalMapFinishedCount = await getCacheOrUpdate('totalMapFinishedCount_' + player, connection, 'SELECT COUNT(DISTINCT Map) as n FROM race_race WHERE Name=?;', [player])
  const shortMapFinishedCount = await getCacheOrUpdate('shortMapFinishedCount_' + player, connection, 'SELECT COUNT(DISTINCT t1.Map) as n FROM race_race t1 INNER JOIN race_maps t2 ON t1.Map = t2.Map WHERE t1.Name=? AND t2.Server="Short";', [player])
  const middleMapFinishedCount = await getCacheOrUpdate('middleMapFinishedCount_' + player, connection, 'SELECT COUNT(DISTINCT t1.Map) as n FROM race_race t1 INNER JOIN race_maps t2 ON t1.Map = t2.Map WHERE t1.Name=? AND t2.Server="Middle";', [player])
  const longMapFinishedCount = await getCacheOrUpdate('longMapFinishedCount_' + player, connection, 'SELECT COUNT(DISTINCT t1.Map) as n FROM race_race t1 INNER JOIN race_maps t2 ON t1.Map = t2.Map WHERE t1.Name=? AND t2.Server="Long";', [player])

  const shortMapRecordsCount = await getCacheOrUpdate('shortMapRecordsCount_' + player, connection, getMapRecordsCategoryQuery('Short'), [player])
  const middleMapRecordsCount = await getCacheOrUpdate('middleMapRecordsCount_' + player, connection, getMapRecordsCategoryQuery('Middle'), [player])
  const longMapRecordsCount = await getCacheOrUpdate('longMapRecordsCount_' + player, connection, getMapRecordsCategoryQuery('Long'), [player])

  const shortMapList = await getCacheOrUpdate('shortMapList_' + player, connection, getMapListPlayerQuery('Short'), [player])

  await forEach(shortMapList, async (x) => {
    const mapRank = await getCacheOrUpdate('longMapList_' + player + '_' + x.Map, connection, `SELECT rank FROM (SELECT @pos := @pos + 1 AS v1, @rank := IF(@prev = Time, @rank, @pos) AS rank, @prev := Time AS v2, Name, Time FROM race_race, (SELECT @pos := 0) i1, (SELECT @rank := -1) i2, (SELECT @prev := -1) i3 WHERE Map="${x.Map}" ORDER BY Time) t WHERE Name=?;`, [player])
    x.rank = mapRank[0].rank
  })
  const middleMapList = await getCacheOrUpdate('middleMapList_' + player, connection, getMapListPlayerQuery('Middle'), [player])

  await forEach(middleMapList, async (x) => {
    const mapRank = await getCacheOrUpdate('longMapList_' + player + '_' + x.Map, connection, `SELECT rank FROM (SELECT @pos := @pos + 1 AS v1, @rank := IF(@prev = Time, @rank, @pos) AS rank, @prev := Time AS v2, Name, Time FROM race_race, (SELECT @pos := 0) i1, (SELECT @rank := -1) i2, (SELECT @prev := -1) i3 WHERE Map="${x.Map}" ORDER BY Time) t WHERE Name=?;`, [player])
    x.rank = mapRank[0].rank
  })

  const longMapList = await getCacheOrUpdate('longMapList_' + player, connection, getMapListPlayerQuery('Long'), [player])

  await forEach(longMapList, async (x) => {
    const mapRank = await getCacheOrUpdate('longMapList_' + player + '_' + x.Map, connection, `SELECT rank FROM (SELECT @pos := @pos + 1 AS v1, @rank := IF(@prev = Time, @rank, @pos) AS rank, @prev := Time AS v2, Name, Time FROM race_race, (SELECT @pos := 0) i1, (SELECT @rank := -1) i2, (SELECT @prev := -1) i3 WHERE Map="${x.Map}" ORDER BY Time) t WHERE Name=?;`, [player])
    x.rank = mapRank[0].rank
  })

  console.log(shortMapRecordsCount)

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

    totalMapFinishedCount: totalMapFinishedCount[0].n,
    shortMapFinishedCount: shortMapFinishedCount[0].n,
    middleMapFinishedCount: middleMapFinishedCount[0].n,
    longMapFinishedCount: longMapFinishedCount[0].n,

    shortMapRecords: shortMapRecordsCount.length > 0 ? shortMapRecordsCount[0] : null,
    middleMapRecords: middleMapRecordsCount.length > 0 ? middleMapRecordsCount[0] : null,
    longMapRecords: longMapRecordsCount.length > 0 ? longMapRecordsCount[0] : null,

    shortMapList: shortMapList,
    middleMapList: middleMapList,
    longMapList: longMapList
  })
})

module.exports = exports = router
