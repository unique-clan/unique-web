const mongoose = require('mongoose');
// Models
var user = require('./models/user');
var application = require('./models/application');
// Plugins
var lastmod = require('./plugins/lastmod');

module.exports = exports = function load () {
  user.plugin(lastmod);
  mongoose.model('User', user);
  mongoose.model('Application', application);
};
