const mongoose = require('mongoose');
// Models
var user = require('./models/user');
var application = require('./models/application');
var map = require('./models/map');
// Plugins
var lastmod = require('./plugins/lastmod');

module.exports = exports = function load() {
  user.plugin(lastmod);
  mongoose.model('User', user);
  mongoose.model('Application', application);
  mongoose.model('Map', map);
};
