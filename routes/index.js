var express = require("express");
var router = express.Router();
var debug = require("debug")("uniqueweb:router");
var fs = require("fs");
// var multer = require("multer");
// var upload = multer({ dest: "uploads/" });
var thumb = require("node-thumbnail").thumb;
var path = require("path");
const ServerStatus = require("../app/serverstatus");
// const mongoose = require("mongoose");
// const ApplicationModel = mongoose.model("Application");
// const MapModel = mongoose.model("Map");
const sql = require("../app/sql");

var serverStatus = new ServerStatus(process.env.SERVERS_LOCATION);
serverStatus.updateStatus();

/* GET home page. */
router.get("/", function (req, res, next) {
    res.render("index", {
        title: "Unique Clan",
    });
});

router.get("/member", function (req, res, next) {
    res.render("member", {
        title: "Members | Unique",
    });
});

router.get("/serverstatus", function (req, res, next) {
    res.redirect("/serverstatus/" + serverStatus.list.map((x) => x.name)[0]);
});

router.get("/serverstatus/:location", function (req, res, next) {
    let serverName = String(req.params.location);
    let serverNames = serverStatus.list.map((x) => x.name);
    if (!serverNames.includes(serverName)) {
        return next();
    }
    res.render("serverstatus", {
        title: serverName + " Server Status | Unique",
        locations: serverStatus.list,
        location: serverStatus.list.filter((x) => x.name === serverName)[0],
    });
});

router.get("/apply", function (req, res, next) {
    res.render("apply", {
        title: "Apply | Unique",
    });
});

// router.post("/apply", async function (req, res, next) {
//     try {
//         if (req.body.gameModes && typeof req.body.gameModes === "string") {
//             req.body.gameModes = req.body.gameModes.split(",");
//         }
//         let App = new ApplicationModel(req.body);
//         await App.save();
//         res.status(201).json({ msg: "Application sent." });
//     } catch (e) {
//         if (e.code === 11000) {
//             return res.status(422).json({
//                 errors: {
//                     twName: {
//                         message: "Application with this name already found.",
//                     },
//                 },
//             });
//         }
//         res.status(422).json(e);
//     }
// });

router.get("/submit", function (req, res, next) {
    res.render("mapupload", {
        title: "Submit Map | Unique",
    });
});

// router.post("/mapupload", upload.single("mapFile"), async function (req, res, next) {
//     let errors = {};
//     let errMessages = [];
//     let error = false;

//     if (req.body.mappers) {
//         req.body.mappers = req.body.mappers.split(",").filter((g) => g.length);
//     }

//     if (req.body.mappers.length < 1) {
//         errors.mappers = {
//             message: "Mappers is required.",
//         };
//         error = true;
//     }

//     if (typeof req.file === "undefined" || !req.file || !req.file.originalname) {
//         errMessages.push("Missing file");
//         error = true;
//     }

//     if (req.file && !req.file.originalname.endsWith(".map")) {
//         errMessages.push("Filename must end on .map");
//         error = true;
//     }

//     if (req.file && /[^\w]/g.test(req.file.originalname.replace(/\.map$/g, ""))) {
//         errMessages.push("Invalid characters in map name, only allowed: a-Z 0-9 _");
//         error = true;
//     }

//     // Max 8mb file size
//     if (req.file && req.file.size > 8 * 1024 * 1024) {
//         errMessages.push("Maximum file size is 8mb");
//         error = true;
//     }

//     let mapFile = null;

//     try {
//         if (req.file) mapFile = fs.readFileSync(req.file.path);
//     } catch (e) {
//         errMessages.push("Error uploading the file, please retry.");
//         error = true;
//     }

//     if (!mapFile && req.file) {
//         errMessages.push("Error uploading the file, please retry.");
//         error = true;
//     }

//     if (error) {
//         if (req.file) {
//             fs.unlinkSync(req.file.path);
//         }
//         return res.status(422).json({ errors: errors, message: errMessages.join("<br>") });
//     }

//     try {
//         await MapModel.create({
//             fileName: req.file.originalname,
//             mappers: req.body.mappers,
//             mapFile: mapFile,
//             encoding: req.file.encoding,
//             size: req.file.size,
//             mimetype: req.file.mimetype,
//         });
//     } catch (e) {
//         fs.unlinkSync(req.file.path);
//         return next(e);
//     }

//     fs.unlinkSync(req.file.path);
//     return res.status(201).json({ msg: "Map submission sent." });
// });

router.get("/tournaments", function (req, res, next) {
    res.render("tournaments", {
        title: "Tournaments | Unique",
    });
});

router.get("/profile", function (req, res, next) {
    res.render("profile", {
        title: "Profile | Unique",
    });
});

router.get("/maps", async function (req, res, next) {
    const connection = await sql.newMysqlConn();
    let search = null;
    let pattern = "%";
    let mapperPattern = "%";
    if (typeof req.query.search === "string" && req.query.search.trim()) {
        search = req.query.search.trim();
        pattern = "%" + sql.escapeLike(req.query.search).replace(/ /g, "%") + "%";
        mapperPattern = "%" + sql.escapeLike(req.query.search) + "%";
        const [
            map,
        ] = await connection.execute(
            'SELECT IFNULL((SELECT Map FROM record_maps WHERE Map=?), (SELECT Map FROM record_maps WHERE Map COLLATE utf8mb4_general_ci LIKE ? HAVING COUNT(*) = 1)) AS Map;',
            [search, pattern],
        );
        if (map[0].Map) {
            res.redirect("/map/" + encodeURIComponent(map[0].Map));
            connection.end();
            return;
        }
    }
    const [
        mapCount,
    ] = await connection.execute(
        'SELECT COUNT(*) as Count FROM record_maps WHERE (Map COLLATE utf8mb4_general_ci LIKE ? OR Mapper COLLATE utf8mb4_general_ci LIKE ?);',
        [pattern, mapperPattern],
    );
    const pageCount = Math.ceil(mapCount[0]["Count"] / 30);
    const page = Math.min(Math.max(1, req.query.page), pageCount) || 1;
    const [
        maps,
    ] = await connection.execute(
        'SELECT Map, Server, Mapper, Timestamp FROM record_maps WHERE (Map COLLATE utf8mb4_general_ci LIKE ? OR Mapper COLLATE utf8mb4_general_ci LIKE ?) ORDER BY Timestamp DESC, Map COLLATE utf8mb4_general_ci LIMIT ?, 30;',
        [pattern, mapperPattern, (page - 1) * 30],
    );
    connection.end();
    if (process.env.MAPS_LOCATION) {
        for (let i = 0; i < maps.length; i++) {
            try {
                await thumb({
                    source: path.join(process.env.MAPS_LOCATION, maps[i].Map + ".png"),
                    destination: path.join(__dirname, "../public/img/mapthumb"),
                    width: 720,
                    skip: true,
                    suffix: "",
                    quiet: true,
                });
            } catch (e) {
                debug(e);
            }
        }
    }
    res.render("maps", {
        title: "Maps | Unique",
        page: page,
        pageCount: pageCount,
        maps: maps,
        search: search,
        getMappers: sql.getMappers,
    });
});

router.get("/map/:map", async function (req, res, next) {
    const connection = await sql.newMysqlConn();
    const [
        map,
    ] = await connection.execute(
        "SELECT Map, Server, Mapper, Timestamp, (SELECT COUNT(DISTINCT Name) FROM record_race WHERE Map = l.Map) AS Finishers FROM record_maps l WHERE Map = ?;",
        [req.params.map],
    );
    if (!map.length) {
        res.status(404).render("error", { message: "Not Found", error: { status: 404 } });
        connection.end();
        return;
    }

    const topTen = await sql.getCacheOrUpdate(
        "mapOverviewTopTen_" + map[0].Map,
        connection,
        "SELECT RANK() OVER (ORDER BY Time) AS rank, Name, Time FROM (SELECT Name, MIN(Time) AS Time FROM record_race WHERE Map=? GROUP BY Name ORDER BY Time) v LIMIT 10;",
        [map[0].Map],
    );
    const lastRecords = await sql.getCacheOrUpdate(
        "mapOverviewLastRecords_" + map[0].Map,
        connection,
        "SELECT Name, Timestamp, Time FROM cache_records WHERE Map=? ORDER BY Timestamp DESC LIMIT 100;",
        [map[0].Map],
    );

    connection.end();
    res.render("map", {
        title: req.params.map + " | Unique",
        map: map[0],
        topTen: topTen,
        lastRecords: lastRecords,
        formatTime: sql.formatTime,
        getMappers: sql.getMappers,
    });
});

router.get("/mapper/:mapper", async function (req, res, next) {
    const connection = await sql.newMysqlConn();
    const pattern = "%" + sql.escapeLike(req.params.mapper) + "%";
    let [
        maps,
    ] = await connection.execute(
        'SELECT Map, Server, Mapper, Timestamp FROM record_maps WHERE Mapper LIKE ? ORDER BY Timestamp DESC, Map COLLATE utf8mb4_general_ci;',
        [pattern],
    );
    connection.end();
    maps = maps.filter((map) => sql.getMappers(map).includes(req.params.mapper));
    if (!maps.length) {
        res.status(404).render("error", { message: "Not Found", error: { status: 404 } });
        return;
    }

    if (process.env.MAPS_LOCATION) {
        for (let i = 0; i < maps.length; i++) {
            try {
                await thumb({
                    source: path.join(process.env.MAPS_LOCATION, maps[i].Map + ".png"),
                    destination: path.join(__dirname, "../public/img/mapthumb"),
                    width: 720,
                    skip: true,
                    suffix: "",
                    quiet: true,
                });
            } catch (e) {
                debug(e);
            }
        }
    }

    res.render("mapper", {
        title: `Maps by ${req.params.mapper} | Unique`,
        mapper: req.params.mapper,
        mapCount: maps.length,
        categories: {
            Short: maps.filter((m) => m.Server.startsWith("Short")),
            Middle: maps.filter((m) => m.Server.startsWith("Middle")),
            Long: maps.filter((m) => m.Server.startsWith("Long")),
            Fastcap: maps.filter((m) => m.Server.startsWith("Fastcap")),
        },
        getMappers: sql.getMappers,
    });
});

module.exports = router;
