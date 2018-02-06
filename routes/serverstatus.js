var exports = module.exports = {}
var fs = require('fs')
var util = require('util')
var child_process = require('child_process')

const readFile = util.promisify(fs.readFile)
const sleep = util.promisify(setTimeout)
const exec = cmd => new Promise(resolve => child_process.exec(cmd, resolve))

exports.locations = {}

async function get_serverstatus(loc) {
  // get serverstatus, see loc.ip and loc.servers
}

async function fetch_location(loc) {
  error = await exec('ping -c1 -W1 ' + loc.ip)
  loc.reachable = !error
  if (loc.reachable)
    await get_serverstatus(loc)
}

async function update_locations() {
  while (true) {
    serversfile = await readFile(process.env.SERVERS_LOCATION || 'servers.json', 'utf8')
    let tmplocs = JSON.parse(serversfile)
    tmplocs[Object.keys(tmplocs)[0]].first = true;
    tasks = Object.keys(tmplocs).map(locname => fetch_location(tmplocs[locname]))
    await Promise.all(tasks)
    exports.locations = tmplocs
    await sleep(5000)
  }
}

update_locations()
