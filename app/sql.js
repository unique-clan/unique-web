var exports = module.exports = {};
const mysql = require('mysql2/promise');
const NodeCache = require('node-cache');

var cacheOptions = {};

if (process.env.TW_DB_CACHE_TIME) {
  cacheOptions.stdTTL = parseInt(process.env.TW_DB_CACHE_TIME);
} else {
  cacheOptions.stdTTL = 120;
}

const dbCache = new NodeCache(cacheOptions);

var mysqlOptions = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
};

exports.getCacheOrUpdate = async function (key, connection, query, params = []) {
  const val = dbCache.get(key);

  if (val === undefined) {
    const [updatedValue] = await connection.execute(query, params);
    dbCache.set(key, updatedValue);
    return updatedValue;
  } else {
    return val;
  }
};

exports.newMysqlConn = async function () {
  return await mysql.createConnection(mysqlOptions);
};

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

exports.formatTime = function (time) {
  var ms = (time % 1).toFixed(3).substring(2);
  var minutes = Math.floor(time / 60);
  var seconds = Math.floor(time - minutes * 60);
  return `${pad(minutes, 2)}:${pad(seconds, 2)}.${pad(ms, 3)}`;
};

exports.escapeLike = function (pattern) {
  return pattern.replace(/%/g, '\\%').replace(/_/g, '\\_');
};

exports.getCategory = function (map) {
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
};

exports.getMappers = function (map) {
  return map.Mapper.split(/, | & /);
}
