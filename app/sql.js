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
}

exports.newMysqlConn = async function () {
  return await mysql.createConnection(mysqlOptions);
}
