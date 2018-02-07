var exports = module.exports = {}
var fs = require('fs')
var util = require('util')
var child_process = require('child_process')

const readFile = util.promisify(fs.readFile)
const sleep = util.promisify(setTimeout)
const exec = cmd => new Promise(resolve => child_process.exec(cmd, resolve))

exports.locations = {}

async function getServerstatus (loc) {
  // get serverstatus, see loc.ip and loc.servers
}

async function fetchLocation (loc) {
  var error = await exec('ping -c1 -W1 ' + loc.ip)
  loc.reachable = !error
  if (loc.reachable) {
    await getServerstatus(loc)
  }
}

async function updateLocations () {
  while (true) {
    var serversfile = await readFile(process.env.SERVERS_LOCATION || 'servers.json', 'utf8')
    var tmplocs = JSON.parse(serversfile)
    tmplocs[Object.keys(tmplocs)[0]].first = true
    var tasks = Object.keys(tmplocs).map(locname => fetchLocation(tmplocs[locname]))
    await Promise.all(tasks)
    exports.locations = tmplocs
    await sleep(5000)
  }
}

// this is wrong??? FIX IT
module.exports = exports = updateLocations
