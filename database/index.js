const mongoose = require('mongoose');
// Models
var user = require('./models/user');
// Plugins
var lastmod = require('./plugins/lastmod');

module.exports = exports = function load () {
  user.plugin(lastmod);
  mongoose.model('User', user);
};
