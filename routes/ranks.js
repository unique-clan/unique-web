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

router.get('/', async function (req, res, next) {
  const connection = await mysql.createConnection(mysqlOptions)
  const [mapCount] = await connection.execute('SELECT count(*) as numMaps FROM race_maps')
  const [topPoints] = await connection.execute('SELECT * FROM `race_points` ORDER BY `Points` DESC LIMIT 20')
  const [lastTopRanks] = await connection.execute('SELECT Map, ROUND(MIN(Time), 3) as Time, Name, Server, Timestamp FROM race_race GROUP BY Map ORDER BY Timestamp DESC LIMIT 20')
  res.render('ranks', {
    title: 'Ranks | Unique',
    user: req.session.authed ? req.session.user : null,
    topPoints: topPoints,
    maxPoints: mapCount[0].numMaps * 100,
    lastTopRanks: lastTopRanks
  })
})

module.exports = exports = router
