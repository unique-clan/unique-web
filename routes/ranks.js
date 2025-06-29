var express = require("express");
var router = express.Router();
const sql = require("../app/sql");

const topRecordsQuery =
    "SELECT RANK() OVER (ORDER BY recordsCount DESC) AS rank, Name, recordsCount FROM (SELECT Name, COUNT(*) as recordsCount FROM cache_ranks WHERE Rank=1 GROUP BY Name ORDER BY recordsCount DESC) v LIMIT 10;";
const topRecordsCategoryQuery =
    "SELECT RANK() OVER (ORDER BY recordsCount DESC) AS rank, Name, recordsCount FROM (SELECT Name, COUNT(*) as recordsCount FROM cache_ranks rr INNER JOIN record_maps rm ON rr.Map = rm.Map WHERE rr.Rank=1 AND rm.Server LIKE ? GROUP BY Name ORDER BY recordsCount DESC) v LIMIT 10;";
const topPointsQuery =
    "SELECT RANK() OVER (ORDER BY Points DESC) AS rank, Name, Points FROM record_points WHERE Points > 0 ORDER BY Points DESC LIMIT 10;";
const topPointsCategoryQuery =
    "SELECT RANK() OVER (ORDER BY Points DESC) AS rank, Name, Points FROM (SELECT Name, SUM(cache_points.Points) as Points FROM cache_points JOIN record_maps ON cache_points.Map = record_maps.Map WHERE Server LIKE ? GROUP BY Name) v WHERE Points > 0 ORDER BY Points DESC LIMIT 10;";
const mapCountQuery = "SELECT COUNT(*) as n from record_maps";
const mapCountCategoryQuery = "SELECT COUNT(*) as n from record_maps where Server LIKE ?";

const recordsPlayerQuery =
    "SELECT rank, recordsCount FROM (SELECT RANK() OVER (ORDER BY recordsCount DESC) AS rank, Name, recordsCount FROM (SELECT Name, COUNT(*) as recordsCount FROM cache_ranks WHERE Rank=1 GROUP BY Name ORDER BY recordsCount DESC) v) w WHERE Name=?;";
const recordsCategoryPlayerQuery =
    "SELECT rank, recordsCount FROM (SELECT RANK() OVER (ORDER BY recordsCount DESC) AS rank, Name, recordsCount FROM (SELECT Name, COUNT(*) as recordsCount FROM cache_ranks rr INNER JOIN record_maps rm ON rr.Map = rm.Map WHERE rr.Rank=1 AND rm.Server LIKE ? GROUP BY Name ORDER BY recordsCount DESC) v) w WHERE Name=?;";
const pointsPlayerQuery =
    "SELECT rank, Points FROM (SELECT RANK() OVER (ORDER BY Points DESC) AS rank, Name, Points FROM record_points WHERE Points > 0 ORDER BY Points DESC) t WHERE Name=?;";
const pointsPlayerCategoryQuery =
    "SELECT rank, Points FROM (SELECT RANK() OVER (ORDER BY Points DESC) AS rank, Name, Points FROM (SELECT Name, SUM(cache_points.Points) as Points FROM cache_points JOIN record_maps ON cache_points.Map = record_maps.Map WHERE Server LIKE ? GROUP BY Name) v WHERE Points > 0 ORDER BY Points DESC) t WHERE Name=?;";

const mapFinishedCountQuery = "SELECT COUNT(DISTINCT Map) as n FROM record_race WHERE Name=?;";
const mapFinishedCountCategoryQuery =
    "SELECT COUNT(DISTINCT t1.Map) as n FROM record_race t1 INNER JOIN record_maps t2 ON t1.Map = t2.Map WHERE t1.Name=? AND t2.Server LIKE ?;";
const mapListQuery =
    "SELECT Server, t1.Map, playerTime, Rank, Points FROM (SELECT Map, MIN(Time) as playerTime FROM record_race WHERE Name=? GROUP BY Map) t1 INNER JOIN (SELECT Map, Server FROM record_maps) t2 ON t1.Map = t2.Map INNER JOIN (SELECT Map, Rank FROM cache_ranks WHERE Name=?) t3 ON t1.Map = t3.Map INNER JOIN (SELECT Map, Points FROM cache_points WHERE Name=?) t4 ON t1.Map = t4.Map";
const unfinishedMapsQuery =
    "SELECT t1.Map FROM (SELECT Map FROM record_maps WHERE Server LIKE ?) t1 LEFT JOIN (SELECT Map FROM record_race WHERE Name=?) t2 ON t1.Map = t2.Map WHERE t2.Map IS NULL;";

router.get("/", async function (req, res, next) {
    const connection = await sql.newMysqlConn();

    const mapRecords = await sql.getCacheOrUpdate("mapRecords", connection, topRecordsQuery);

    const topPoints = await sql.getCacheOrUpdate("topPoints", connection, topPointsQuery);

    const topPointsShort = await sql.getCacheOrUpdate("topPointsShort", connection, topPointsCategoryQuery, ["Short%"]);
    const topPointsMiddle = await sql.getCacheOrUpdate("topPointsMiddle", connection, topPointsCategoryQuery, [
        "Middle%",
    ]);
    const topPointsLong = await sql.getCacheOrUpdate("topPointsLong", connection, topPointsCategoryQuery, ["Long%"]);
    const topPointsFastcap = await sql.getCacheOrUpdate("topPointsFastcap", connection, topPointsCategoryQuery, [
        "Fastcap%",
    ]);

    const mapRecordsShort = await sql.getCacheOrUpdate("mapRecordsShort", connection, topRecordsCategoryQuery, [
        "Short%",
    ]);
    const mapRecordsMiddle = await sql.getCacheOrUpdate("mapRecordsMiddle", connection, topRecordsCategoryQuery, [
        "Middle%",
    ]);
    const mapRecordsLong = await sql.getCacheOrUpdate("mapRecordsLong", connection, topRecordsCategoryQuery, ["Long%"]);
    const mapRecordsFastcap = await sql.getCacheOrUpdate("mapRecordsFastcap", connection, topRecordsCategoryQuery, [
        "Fastcap%",
    ]);

    const totalMapCount = await sql.getCacheOrUpdate("totalMapCount", connection, mapCountQuery);
    const shortMapCount = await sql.getCacheOrUpdate("shortMapCount", connection, mapCountCategoryQuery, ["Short%"]);
    const middleMapCount = await sql.getCacheOrUpdate("middleMapCount", connection, mapCountCategoryQuery, ["Middle%"]);
    const longMapCount = await sql.getCacheOrUpdate("longMapCount", connection, mapCountCategoryQuery, ["Long%"]);
    const fastcapMapCount = await sql.getCacheOrUpdate("fastcapMapCount", connection, mapCountCategoryQuery, [
        "Fastcap%",
    ]);

    connection.end();

    res.render("ranks", {
        title: "Ranks | Unique",
        topPoints: topPoints,
        // lastTopRanks: lastTopRanks,
        formatTime: sql.formatTime,

        mapRecords: mapRecords,
        mapRecordsShort: mapRecordsShort,
        mapRecordsMiddle: mapRecordsMiddle,
        mapRecordsLong: mapRecordsLong,
        mapRecordsFastcap: mapRecordsFastcap,

        topPointsShort: topPointsShort,
        topPointsMiddle: topPointsMiddle,
        topPointsLong: topPointsLong,
        topPointsFastcap: topPointsFastcap,

        totalMapCount: totalMapCount.length > 0 ? totalMapCount[0].n : "Unknown",
        numShortMaps: shortMapCount.length > 0 ? shortMapCount[0].n : "Unknown",
        numMiddleMaps: middleMapCount.length > 0 ? middleMapCount[0].n : "Unknown",
        numLongMaps: longMapCount.length > 0 ? longMapCount[0].n : "Unknown",
        numFastcapMaps: fastcapMapCount.length > 0 ? fastcapMapCount[0].n : "Unknown",
    });
});

router.get("/player/:name", async function (req, res, next) {
    var player = String(req.params.name);

    const connection = await sql.newMysqlConn();

    const totalMapFinishedCount = await sql.getCacheOrUpdate(
        "totalMapFinishedCount_" + player,
        connection,
        mapFinishedCountQuery,
        [player],
    );

    if (!totalMapFinishedCount[0].n) {
        res.status(404).render("error", { message: "Not Found", error: { status: 404 } });
        connection.end();
        return;
    }

    const mapRecords = await sql.getCacheOrUpdate("mapRecords_" + player, connection, recordsPlayerQuery, [player]);

    const playerPoints = await sql.getCacheOrUpdate("playerPoints_" + player, connection, pointsPlayerQuery, [player]);

    const totalMapCount = await sql.getCacheOrUpdate("totalMapCount", connection, mapCountQuery);
    const shortMapCount = await sql.getCacheOrUpdate("shortMapCount", connection, mapCountCategoryQuery, ["Short%"]);
    const middleMapCount = await sql.getCacheOrUpdate("middleMapCount", connection, mapCountCategoryQuery, ["Middle%"]);
    const longMapCount = await sql.getCacheOrUpdate("longMapCount", connection, mapCountCategoryQuery, ["Long%"]);
    const fastcapMapCount = await sql.getCacheOrUpdate("fastcapMapCount", connection, mapCountCategoryQuery, ["Fastcap%"]);

    const shortMapFinishedCount = await sql.getCacheOrUpdate(
        "shortMapFinishedCount_" + player,
        connection,
        mapFinishedCountCategoryQuery,
        [player, "Short%"],
    );
    const middleMapFinishedCount = await sql.getCacheOrUpdate(
        "middleMapFinishedCount_" + player,
        connection,
        mapFinishedCountCategoryQuery,
        [player, "Middle%"],
    );
    const longMapFinishedCount = await sql.getCacheOrUpdate(
        "longMapFinishedCount_" + player,
        connection,
        mapFinishedCountCategoryQuery,
        [player, "Long%"],
    );
    const fastcapMapFinishedCount = await sql.getCacheOrUpdate(
        "fastcapMapFinishedCount_" + player,
        connection,
        mapFinishedCountCategoryQuery,
        [player, "Fastcap%"],
    );

    const shortMapRecordsCount = await sql.getCacheOrUpdate(
        "shortMapRecordsCount_" + player,
        connection,
        recordsCategoryPlayerQuery,
        ["Short%", player],
    );
    const middleMapRecordsCount = await sql.getCacheOrUpdate(
        "middleMapRecordsCount_" + player,
        connection,
        recordsCategoryPlayerQuery,
        ["Middle%", player],
    );
    const longMapRecordsCount = await sql.getCacheOrUpdate(
        "longMapRecordsCount_" + player,
        connection,
        recordsCategoryPlayerQuery,
        ["Long%", player],
    );
    const fastcapMapRecordsCount = await sql.getCacheOrUpdate(
        "fastcapMapRecordsCount_" + player,
        connection,
        recordsCategoryPlayerQuery,
        ["Fastcap%", player],
    );

    const shortPoints = await sql.getCacheOrUpdate("shortPoints_" + player, connection, pointsPlayerCategoryQuery, [
        "Short%",
        player,
    ]);
    const middlePoints = await sql.getCacheOrUpdate("middlePoints_" + player, connection, pointsPlayerCategoryQuery, [
        "Middle%",
        player,
    ]);
    const longPoints = await sql.getCacheOrUpdate("longPoints_" + player, connection, pointsPlayerCategoryQuery, [
        "Long%",
        player,
    ]);
    const fastcapPoints = await sql.getCacheOrUpdate("fastcapPoints_" + player, connection, pointsPlayerCategoryQuery, [
        "Fastcap%",
        player,
    ]);

    const mapList = await sql.getCacheOrUpdate("mapList_" + player, connection, mapListQuery, [
        player,
        player,
        player,
    ]);

    const unfinishedShort = await sql.getCacheOrUpdate("unfinishedShort_" + player, connection, unfinishedMapsQuery, [
        "Short%",
        player,
    ]);
    const unfinishedMiddle = await sql.getCacheOrUpdate("unfinishedMiddle_" + player, connection, unfinishedMapsQuery, [
        "Middle%",
        player,
    ]);
    const unfinishedLong = await sql.getCacheOrUpdate("unfinishedLong_" + player, connection, unfinishedMapsQuery, [
        "Long%",
        player,
    ]);
    const unfinishedFastcap = await sql.getCacheOrUpdate("unfinishedFastcap_" + player, connection, unfinishedMapsQuery, [
        "Fastcap%",
        player,
    ]);

    connection.end();

    res.render("playerranks", {
        title: `Ranks for ${player} | Unique`,
        name: player,

        formatTime: sql.formatTime,

        mapRecords: mapRecords.length > 0 ? mapRecords[0] : null,
        // lastRecords: lastRecords,
        playerPoints: playerPoints.length > 0 ? playerPoints[0] : null,

        totalMapCount: totalMapCount.length > 0 ? totalMapCount[0].n : "Unknown",
        numShortMaps: shortMapCount.length > 0 ? shortMapCount[0].n : "Unknown",
        numMiddleMaps: middleMapCount.length > 0 ? middleMapCount[0].n : "Unknown",
        numLongMaps: longMapCount.length > 0 ? longMapCount[0].n : "Unknown",
        numFastcapMaps: fastcapMapCount.length > 0 ? fastcapMapCount[0].n : "Unknown",

        totalMapFinishedCount: totalMapFinishedCount[0].n,
        shortMapFinishedCount: shortMapFinishedCount[0].n,
        middleMapFinishedCount: middleMapFinishedCount[0].n,
        longMapFinishedCount: longMapFinishedCount[0].n,
        fastcapMapFinishedCount: fastcapMapFinishedCount[0].n,

        shortMapRecords: shortMapRecordsCount.length > 0 ? shortMapRecordsCount[0] : null,
        middleMapRecords: middleMapRecordsCount.length > 0 ? middleMapRecordsCount[0] : null,
        longMapRecords: longMapRecordsCount.length > 0 ? longMapRecordsCount[0] : null,
        fastcapMapRecords: fastcapMapRecordsCount.length > 0 ? fastcapMapRecordsCount[0] : null,

        shortMapList: mapList.filter(row => row.Server.startsWith("Short")),
        middleMapList: mapList.filter(row => row.Server.startsWith("Middle")),
        longMapList: mapList.filter(row => row.Server.startsWith("Long")),
        fastcapMapList: mapList.filter(row => row.Server.startsWith("Fastcap")),

        shortPoints: shortPoints.length > 0 ? shortPoints[0] : null,
        middlePoints: middlePoints.length > 0 ? middlePoints[0] : null,
        longPoints: longPoints.length > 0 ? longPoints[0] : null,
        fastcapPoints: fastcapPoints.length > 0 ? fastcapPoints[0] : null,

        unfinishedShort: unfinishedShort,
        unfinishedMiddle: unfinishedMiddle,
        unfinishedLong: unfinishedLong,
        unfinishedFastcap: unfinishedFastcap,
    });
});

router.get("/search", async function (req, res, next) {
    const connection = await sql.newMysqlConn();
    let search = null;
    let pattern = "%";
    if (typeof req.query.search === "string" && req.query.search.trim()) {
        search = req.query.search.trim();
        pattern = "%" + sql.escapeLike(req.query.search).replace(/ /g, "%") + "%";
        const [
            player,
        ] = await connection.execute(
            "SELECT IFNULL((SELECT DISTINCT Name FROM record_race WHERE Name=?), (SELECT DISTINCT Name FROM record_race WHERE Name COLLATE utf8mb4_general_ci LIKE ? HAVING COUNT(DISTINCT Name) = 1)) AS Name;",
            [search, pattern],
        );
        if (player[0].Name) {
            res.redirect("/ranks/player/" + encodeURIComponent(player[0].Name));
            connection.end();
            return;
        }
    }
    const [
        playerCount,
    ] = await connection.execute(
        "SELECT COUNT(DISTINCT Name) as Count FROM record_race WHERE Name COLLATE utf8mb4_general_ci LIKE ?;",
        [pattern],
    );
    const pageCount = Math.ceil(playerCount[0]["Count"] / 60);
    const page = Math.min(Math.max(1, req.query.page), pageCount) || 1;
    const [
        players,
    ] = await connection.execute(
        "SELECT DISTINCT t1.Name, t2.recordsCount, t3.Points FROM record_race t1 LEFT JOIN (SELECT Name, COUNT(*) as recordsCount FROM cache_ranks WHERE Rank = 1 GROUP BY Name) t2 ON t1.Name = t2.Name LEFT JOIN record_points t3 ON t1.Name = t3.Name WHERE t1.Name COLLATE utf8mb4_general_ci LIKE ? ORDER BY t2.recordsCount DESC, t3.Points DESC, t1.Name COLLATE utf8mb4_general_ci LIMIT ?, 60;",
        [pattern, (page - 1) * 60],
    );
    connection.end();
    res.render("playersearch", {
        title: "Players | Unique",
        page: page,
        pageCount: pageCount,
        players: players,
        search: search,
    });
});

module.exports = exports = router;
