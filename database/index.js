const mongoose = require('mongoose')
// Models
var applications = require('./models/applications')
// Plugins
var lastmod = require('./plugins/lastmod')

module.exports = exports = function load () {
  applications.plugin(lastmod)
  mongoose.model('Application', applications)
}
