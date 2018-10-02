var express = require('express');
var router = express.Router();
var debug = require('debug')('uniqueweb:ranks');
const sql = require('../app/sql');

setInterval(async () => {
  const connection = await sql.newMysqlConn();
  const [maps] = await connection.execute('SELECT Map FROM race_maps;');
  for (let x in maps) {
    var query = 'INSERT INTO race_ranks SELECT Map, Name, Rank FROM (SELECT @pos := @pos + 1 AS v1, @rank := IF(@prev = playerTime, @rank, @pos) AS rank, @prev := playerTime AS v2, Map, Name, playerTime FROM (SELECT Map, Name, ROUND(MIN(Time), 3) AS playerTime FROM race_race WHERE Map=? GROUP BY Name) t, (SELECT @pos := 0) i1, (SELECT @rank := -1) i2, (SELECT @prev := -1) i3 ORDER BY playerTime) u ON DUPLICATE KEY UPDATE Rank=VALUES(Rank);';
    await connection.execute(query, [maps[x].Map]);
  }
  connection.end();
}, 2 * 60 * 1000);

// https://stackoverflow.com/questions/13627308/add-st-nd-rd-and-th-ordinal-suffix-to-a-number#13627586
function getOrdinal (n) {
  var s = ['th', 'st', 'nd', 'rd'];
  var v = n % 100;
  return (s[(v - 20) % 10] || s[v] || s[0]);
}

const topRecordsQuery = 'SELECT @pos := @pos + 1 AS v1, @rank := IF(@prev = recordsCount, @rank, @pos) AS rank, @prev := recordsCount AS v2, Name, recordsCount FROM (SELECT Name, COUNT(*) as recordsCount FROM (SELECT Name, t1.Map as Map FROM (SELECT Map, Name, ROUND(Time, 3) AS playerTime FROM race_race) t1 INNER JOIN (SELECT Map, ROUND(MIN(Time), 3) AS bestTime FROM race_race GROUP BY Map) t2 ON t1.Map = t2.Map AND t1.playerTime = t2.bestTime) u GROUP BY Name ORDER BY recordsCount DESC) v, (SELECT @pos := 0) i1, (SELECT @rank := -1) i2, (SELECT @prev := -1) i3 LIMIT 10;';
const topRecordsCategoryQuery = 'SELECT @pos := @pos + 1 AS v1, @rank := IF(@prev = recordsCount, @rank, @pos) AS rank, @prev := recordsCount AS v2, Name, recordsCount FROM (SELECT Name, COUNT(*) as recordsCount FROM (SELECT Name, t1.Map as Map FROM (SELECT v1.Map, v1.Name, ROUND(v1.Time, 3) AS playerTime FROM race_race v1 INNER JOIN race_maps v2 ON v1.Map = v2.Map WHERE v2.Server=?) t1 INNER JOIN (SELECT Map, ROUND(MIN(Time), 3) AS bestTime FROM race_race GROUP BY Map) t2 ON t1.Map = t2.Map AND t1.playerTime = t2.bestTime) u GROUP BY Name ORDER BY recordsCount DESC) v, (SELECT @pos := 0) i1, (SELECT @rank := -1) i2, (SELECT @prev := -1) i3 LIMIT 10;';
const topPointsQuery = 'SELECT @pos := @pos + 1 AS v1, @rank := IF(@prev = Points, @rank, @pos) AS rank, @prev := Points AS v2, Name, Points FROM race_points, (SELECT @pos := 0) i1, (SELECT @rank := -1) i2, (SELECT @prev := -1) i3 WHERE Points > 0 ORDER BY Points DESC LIMIT 10;';
const topPointsCategoryQuery = 'SELECT @pos := @pos + 1 AS v1, @rank := IF(@prev = Points, @rank, @pos) AS rank, @prev := Points AS v2, Name, Points FROM race_catpoints, (SELECT @pos := 0) i1, (SELECT @rank := -1) i2, (SELECT @prev := -1) i3 WHERE Server=? AND Points > 0 ORDER BY Points DESC LIMIT 10;';
const lastRecordsQuery = 'SELECT Map, Name, Timestamp, Time FROM race_lastrecords ORDER BY Timestamp DESC LIMIT 10;';
const mapCountQuery = 'SELECT COUNT(*) as n from race_maps';
const mapCountCategoryQuery = 'SELECT COUNT(*) as n from race_maps where Server=?';

const recordsPlayerQuery = 'SELECT rank, recordsCount FROM (SELECT @pos := @pos + 1 AS v1, @rank := IF(@prev = recordsCount, @rank, @pos) AS rank, @prev := recordsCount AS v2, Name, recordsCount FROM (SELECT Name, COUNT(*) as recordsCount FROM (SELECT Name, t1.Map as Map FROM (SELECT Map, Name, ROUND(Time, 3) AS playerTime FROM race_race) t1 INNER JOIN (SELECT Map, ROUND(MIN(Time), 3) AS bestTime FROM race_race GROUP BY Map) t2 ON t1.Map = t2.Map AND t1.playerTime = t2.bestTime) u GROUP BY Name ORDER BY recordsCount DESC) v, (SELECT @pos := 0) i1, (SELECT @rank := -1) i2, (SELECT @prev := -1) i3) w WHERE Name=?;';
const recordsCategoryPlayerQuery = 'SELECT rank, recordsCount FROM (SELECT @pos := @pos + 1 AS v1, @rank := IF(@prev = recordsCount, @rank, @pos) AS rank, @prev := recordsCount AS v2, Name, recordsCount FROM (SELECT Name, COUNT(*) as recordsCount FROM (SELECT Name, t1.Map as Map FROM (SELECT v1.Map, v1.Name, ROUND(v1.Time, 3) AS playerTime FROM race_race v1 INNER JOIN race_maps v2 ON v1.Map = v2.Map WHERE v2.Server=?) t1 INNER JOIN (SELECT Map, ROUND(MIN(Time), 3) AS bestTime FROM race_race GROUP BY Map) t2 ON t1.Map = t2.Map AND t1.playerTime = t2.bestTime) u GROUP BY Name ORDER BY recordsCount DESC) v, (SELECT @pos := 0) i1, (SELECT @rank := -1) i2, (SELECT @prev := -1) i3) w WHERE Name=?;';
const pointsPlayerQuery = 'SELECT rank, Points FROM (SELECT @pos := @pos + 1 AS v1, @rank := IF(@prev = Points, @rank, @pos) AS rank, @prev := Points AS v2, Name, Points FROM race_points, (SELECT @pos := 0) i1, (SELECT @rank := -1) i2, (SELECT @prev := -1) i3 WHERE Points > 0 ORDER BY Points DESC) t WHERE Name=?;';
const pointsPlayerCategoryQuery = 'SELECT rank, Points FROM (SELECT @pos := @pos + 1 AS v1, @rank := IF(@prev = Points, @rank, @pos) AS rank, @prev := Points AS v2, Name, Points FROM race_catpoints, (SELECT @pos := 0) i1, (SELECT @rank := -1) i2, (SELECT @prev := -1) i3 WHERE Server=? AND Points > 0 ORDER BY Points DESC) t WHERE Name=?;';
const lastRecordsPlayerQuery = 'SELECT Map, Name, Timestamp, Time FROM race_lastrecords WHERE Name=? ORDER BY Timestamp DESC LIMIT 10;';

const mapFinishedCountQuery = 'SELECT COUNT(DISTINCT Map) as n FROM race_race WHERE Name=?;';
const mapFinishedCountCategoryQuery = 'SELECT COUNT(DISTINCT t1.Map) as n FROM race_race t1 INNER JOIN race_maps t2 ON t1.Map = t2.Map WHERE t1.Name=? AND t2.Server=?;';
const mapListQuery = 'SELECT t1.Map as Map, playerTime, Rank, FLOOR(100*EXP(-S*(playerTime/bestTime-1))) as mapPoints FROM (SELECT Map, ROUND(MIN(Time), 3) AS playerTime FROM race_race WHERE Name=? GROUP BY Map) t1 INNER JOIN (SELECT Map, ROUND(MIN(Time), 3) AS bestTime FROM race_race GROUP BY Map) t2 ON t1.Map = t2.Map INNER JOIN (SELECT Map, CASE WHEN Server="Short" THEN 5.0 WHEN Server="Middle" THEN 3.5 WHEN Server="Long" THEN CASE WHEN Stars=0 THEN 2.0 WHEN Stars=1 THEN 1.0 WHEN Stars=2 THEN 0.05 END END AS S FROM race_maps WHERE Server=?) t3 ON t1.Map = t3.Map INNER JOIN (SELECT Map, Rank FROM race_ranks WHERE Name=?) t4 ON t1.Map = t4.Map ORDER BY LOWER(t1.Map);';
const unfinishedMapsQuery = 'SELECT t1.Map FROM (SELECT Map FROM race_maps WHERE Server=?) t1 LEFT JOIN (SELECT Map FROM race_race WHERE Name=?) t2 ON t1.Map = t2.Map WHERE t2.Map IS NULL;';

router.get('/', async function (req, res, next) {
  const connection = await sql.newMysqlConn();

  const mapRecords = await sql.getCacheOrUpdate('mapRecords', connection, topRecordsQuery);

  const topPoints = await sql.getCacheOrUpdate('topPoints', connection, topPointsQuery);

  const topPointsShort = await sql.getCacheOrUpdate('topPointsShort', connection, topPointsCategoryQuery, ['Short']);
  const topPointsMiddle = await sql.getCacheOrUpdate('topPointsMiddle', connection, topPointsCategoryQuery, ['Middle']);
  const topPointsLong = await sql.getCacheOrUpdate('topPointsLong', connection, topPointsCategoryQuery, ['Long']);

  const lastTopRanks = await sql.getCacheOrUpdate('lastTopRanks', connection, lastRecordsQuery);

  const mapRecordsShort = await sql.getCacheOrUpdate('mapRecordsShort', connection, topRecordsCategoryQuery, ['Short']);
  const mapRecordsMiddle = await sql.getCacheOrUpdate('mapRecordsMiddle', connection, topRecordsCategoryQuery, ['Middle']);
  const mapRecordsLong = await sql.getCacheOrUpdate('mapRecordsLong', connection, topRecordsCategoryQuery, ['Long']);

  const totalMapCount = await sql.getCacheOrUpdate('totalMapCount', connection, mapCountQuery);
  const shortMapCount = await sql.getCacheOrUpdate('shortMapCount', connection, mapCountCategoryQuery, ['Short']);
  const middleMapCount = await sql.getCacheOrUpdate('middleMapCount', connection, mapCountCategoryQuery, ['Middle']);
  const longMapCount = await sql.getCacheOrUpdate('longMapCount', connection, mapCountCategoryQuery, ['Long']);

  connection.end();

  res.render('ranks', {
    title: 'Ranks | Unique',
    user: req.session.authed ? req.session.user : null,
    topPoints: topPoints,
    lastTopRanks: lastTopRanks,
    formatTime: sql.formatTime,
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
    numLongMaps: longMapCount.length > 0 ? longMapCount[0].n : 'Unknown'
  });
});

router.get('/player/:name', async function (req, res, next) {
  var player = String(req.params.name);

  const connection = await sql.newMysqlConn();

  const totalMapFinishedCount = await sql.getCacheOrUpdate('totalMapFinishedCount_' + player, connection, mapFinishedCountQuery, [player]);

  if (!totalMapFinishedCount[0].n) {
    res.status(404).render('error', {message: 'Not Found', error: {status: 404}});
    connection.end();
    return;
  }

  const mapRecords = await sql.getCacheOrUpdate('mapRecords_' + player, connection, recordsPlayerQuery, [player]);

  const lastRecords = await sql.getCacheOrUpdate('lastRecords_' + player, connection, lastRecordsPlayerQuery, [player]);

  const playerPoints = await sql.getCacheOrUpdate('playerPoints_' + player, connection, pointsPlayerQuery, [player]);

  const totalMapCount = await sql.getCacheOrUpdate('totalMapCount', connection, mapCountQuery);
  const shortMapCount = await sql.getCacheOrUpdate('shortMapCount', connection, mapCountCategoryQuery, ['Short']);
  const middleMapCount = await sql.getCacheOrUpdate('middleMapCount', connection, mapCountCategoryQuery, ['Middle']);
  const longMapCount = await sql.getCacheOrUpdate('longMapCount', connection, mapCountCategoryQuery, ['Long']);

  const shortMapFinishedCount = await sql.getCacheOrUpdate('shortMapFinishedCount_' + player, connection, mapFinishedCountCategoryQuery, [player, 'Short']);
  const middleMapFinishedCount = await sql.getCacheOrUpdate('middleMapFinishedCount_' + player, connection, mapFinishedCountCategoryQuery, [player, 'Middle']);
  const longMapFinishedCount = await sql.getCacheOrUpdate('longMapFinishedCount_' + player, connection, mapFinishedCountCategoryQuery, [player, 'Long']);

  const shortMapRecordsCount = await sql.getCacheOrUpdate('shortMapRecordsCount_' + player, connection, recordsCategoryPlayerQuery, ['Short', player]);
  const middleMapRecordsCount = await sql.getCacheOrUpdate('middleMapRecordsCount_' + player, connection, recordsCategoryPlayerQuery, ['Middle', player]);
  const longMapRecordsCount = await sql.getCacheOrUpdate('longMapRecordsCount_' + player, connection, recordsCategoryPlayerQuery, ['Long', player]);

  const shortPoints = await sql.getCacheOrUpdate('shortPoints_' + player, connection, pointsPlayerCategoryQuery, ['Short', player]);
  const middlePoints = await sql.getCacheOrUpdate('middlePoints_' + player, connection, pointsPlayerCategoryQuery, ['Middle', player]);
  const longPoints = await sql.getCacheOrUpdate('longPoints_' + player, connection, pointsPlayerCategoryQuery, ['Long', player]);

  const shortMapList = await sql.getCacheOrUpdate('shortMapList_' + player, connection, mapListQuery, [player, 'Short', player]);
  const middleMapList = await sql.getCacheOrUpdate('middleMapList_' + player, connection, mapListQuery, [player, 'Middle', player]);
  const longMapList = await sql.getCacheOrUpdate('longMapList_' + player, connection, mapListQuery, [player, 'Long', player]);

  const unfinishedShort = await sql.getCacheOrUpdate('unfinishedShort_' + player, connection, unfinishedMapsQuery, ['Short', player]);
  const unfinishedMiddle = await sql.getCacheOrUpdate('unfinishedMiddle_' + player, connection, unfinishedMapsQuery, ['Middle', player]);
  const unfinishedLong = await sql.getCacheOrUpdate('unfinishedLong_' + player, connection, unfinishedMapsQuery, ['Long', player]);

  connection.end();

  res.render('playerranks', {
    title: `Ranks for ${player} | Unique`,
    name: player,
    user: req.session.authed ? req.session.user : null,

    formatTime: sql.formatTime,
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
    longMapList: longMapList,

    shortPoints: shortPoints.length > 0 ? shortPoints[0] : null,
    middlePoints: middlePoints.length > 0 ? middlePoints[0] : null,
    longPoints: longPoints.length > 0 ? longPoints[0] : null,

    unfinishedShort: unfinishedShort,
    unfinishedMiddle: unfinishedMiddle,
    unfinishedLong: unfinishedLong
  });
});

router.get('/search', async function (req, res, next) {
  const connection = await sql.newMysqlConn();
  let search = null;
  let pattern = '%';
  if (typeof req.query.search === 'string' && req.query.search.trim()) {
    search = req.query.search.trim();
    pattern = '%' + sql.escapeLike(req.query.search).replace(/ /g, '%') + '%';
    const [player] = await connection.execute('SELECT IFNULL((SELECT DISTINCT Name FROM race_race WHERE Name=?), (SELECT DISTINCT Name FROM race_race WHERE Name COLLATE utf8mb4_general_ci LIKE ? HAVING COUNT(DISTINCT Name) = 1)) AS Name;', [search, pattern]);
    if (player[0].Name) {
      res.redirect('/ranks/player/'+encodeURIComponent(player[0].Name));
      connection.end();
      return;
    }
  }
  const [playerCount] = await connection.execute('SELECT COUNT(DISTINCT Name) as Count FROM race_race WHERE Name COLLATE utf8mb4_general_ci LIKE ?;', [pattern]);
  const pageCount = Math.ceil(playerCount[0]['Count'] / 60);
  const page = Math.min(Math.max(1, req.query.page), pageCount) || 1;
  const [players] = await connection.execute('SELECT DISTINCT t1.Name, t2.recordsCount, t3.Points FROM race_race t1 LEFT JOIN (SELECT Name, COUNT(*) as recordsCount FROM race_ranks WHERE Rank = 1 GROUP BY Name) t2 ON t1.Name = t2.Name LEFT JOIN race_points t3 ON t1.Name = t3.Name WHERE t1.Name COLLATE utf8mb4_general_ci LIKE ? ORDER BY t2.recordsCount DESC, t3.Points DESC, t1.Name COLLATE utf8mb4_general_ci LIMIT ?, 60;', [pattern, (page-1)*60]);
  connection.end();
  res.render('playersearch', {
    title: 'Players | Unique',
    page: page,
    pageCount: pageCount,
    players: players,
    search: search
  });
});

module.exports = exports = router;
