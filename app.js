var express = require("express");
var path = require("path");
var favicon = require("serve-favicon");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var helmet = require("helmet");
var sassMiddleware = require("node-sass-middleware");
var session = require("express-session");
const MongoStore = require("connect-mongo")(session);
var mongoSanitize = require("express-mongo-sanitize");
var debug = require("debug")("uniqueweb:app");
var debugDB = require("debug")("uniqueweb:app:dberror");
var contentDisposition = require("content-disposition");
var escape = require("escape-html");

// Setup the db connection
const mongoose = require("mongoose");

// Load models
require("./database/index")();

mongoose.Promise = global.Promise;

var db = mongoose.connection;
db.on("error", debugDB);
db.once("open", function callback() {
    debug("Connection to database succesfull.");
});

// Build the connection string
var connectionString = "mongodb://";

if (process.env.DATABASE_USERNAME && process.env.DATABASE_PASSWORD) {
    connectionString += `${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@`;
}

if (process.env.DATABASE_HOST && process.env.DATABASE_PORT) {
    connectionString += `${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}`;
} else {
    connectionString += "localhost:27017";
}

connectionString += "/" + (process.env.DATABASE_NAME || "uniqueweb");

mongoose.connect(connectionString, { useNewUrlParser: true });

// Load App routes
var index = require("./routes/index");
var admin = require("./routes/admin");
var ranks = require("./routes/ranks");

var app = express();

// Production security
app.use(helmet({
    contentSecurityPolicy: false,
}));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(favicon(path.join(__dirname, "public", "favicon/favicon.ico")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
    mongoSanitize({
        replaceWith: "_",
    }),
);
app.use(cookieParser());

app.use(
    sassMiddleware({
        src: path.join(__dirname, "public"),
        dest: path.join(__dirname, "public"),
        indentedSyntax: true, // true = .sass and false = .scss
        sourceMap: true,
        outputStyle: "compressed",
        prefix: "/static",
    }),
);
app.use("/static", express.static(path.join(__dirname, "public")));
app.use("/static/css", express.static(path.join(__dirname, "node_modules/bulma/css")));
app.use("/static", express.static(path.join(__dirname, "node_modules/bulma-extensions/dist")));
app.use("/static/servers.json", express.static(process.env.SERVERS_LOCATION || "servers.json"));
if (process.env.MAPS_LOCATION) {
    app.use(
        "/static/maps",
        express.static(process.env.MAPS_LOCATION, {
            setHeaders: function (res, path) {
                if (path.endsWith(".map")) {
                    res.setHeader("Content-Disposition", contentDisposition(path));
                }
            },
        }),
    );
}

app.use(logger("dev"));

if (process.env.BEHIND_PROXY === "true") {
    app.set("trust proxy", 1); // trust first proxy
}
app.use(
    session({
        secret: process.env.COOKIE_SECRET || "unique is the best clan in teeworlds",
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.COOKIE_SECURE === "true",
            expires: new Date(253402300799999),
        },
        name: "uniqueclan.sid",
        store: new MongoStore({
            mongooseConnection: mongoose.connection,
            ttl: 14 * 24 * 60 * 60, // = 14 days. Default
        }),
    }),
);

// make html escape function available in all views
app.locals.escape = escape;

// Add the app routes
app.use("/", index);
app.use("/admin", admin);
app.use("/ranks", ranks);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error("Not Found");
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    // render the error page
    if (!res.headersSent) {
        res.status(err.status || 500);
        res.render("error");
    }
});

module.exports = app;
