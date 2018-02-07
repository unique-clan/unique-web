var router = require('./index')
var fs = require('fs')
var util = require('util')
var child_process = require('child_process')

const readFile = util.promisify(fs.readFile)
const sleep = util.promisify(setTimeout)
const exec = cmd => new Promise(resolve => child_process.exec(cmd, resolve))

locations = {}

router.get('/serverstatus', function (req, res, next) {
  res.redirect('/serverstatus/' + Object.keys(locations)[0])
})

router.get('/serverstatus/:location', function (req, res, next) {
  let location = req.params.location
  if (!(location in locations))
    res.sendStatus(404)
  res.render('serverstatus', {
    title: location + ' Server Status | Unique',
    user: req.session.authed ? req.session.user : null,
    locations: locations,
    location: location
  })
})

async function get_serverstatus(loc) {
  // get serverstatus, see loc.ip and loc.servers

  // dummy data
  if ('race1' in loc.servers) {
    loc.servers.race1.reachable = true
    loc.servers.race1.map = 'run_blabla'
    loc.servers.race1.gametype = 'Race'
    loc.servers.race1.numclients = 3
    loc.servers.race1.maxclients = 32
    loc.servers.race1.players = [
      { name: 'timakro', clan: 'υηιqυє', flag: 'default', score: 19 },
      { name: 'Tezcan', clan: 'Yo xD', flag: twflags[4], score: 19 },
      { name: 'Ryozuki', clan: 'hallo', flag: twflags[276], score: 19 }
    ]
  }
  if ('openfng' in loc.servers) {
    loc.servers.openfng.reachable = true
    loc.servers.openfng.map = 'run_blabla'
    loc.servers.openfng.gametype = 'OpenFNG'
    loc.servers.openfng.numclients = 0
    loc.servers.openfng.maxclients = 16
    loc.servers.openfng.players = []
  }
  if ('bomb' in loc.servers) {
    loc.servers.bomb.reachable = true
    loc.servers.bomb.map = 'run_blabla'
    loc.servers.bomb.gametype = 'Bomb'
    loc.servers.bomb.numclients = 3
    loc.servers.bomb.maxclients = 16
    loc.servers.bomb.players = [
      { name: 'timakro', clan: 'υηιqυє', flag: twflags[276], score: 19 },
      { name: 'Tezcan', clan: 'Yo xD', flag: twflags[4], score: 19 },
      { name: 'Ryozuki', clan: 'hallo', flag: twflags[276], score: 19 }
    ]
  }
  if ('race2' in loc.servers) {
    loc.servers.race2.reachable = false
  }
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
    tmplocs[Object.keys(tmplocs)[0]].first = true
    tasks = Object.keys(tmplocs).map(locname => fetch_location(tmplocs[locname]))
    await Promise.all(tasks)
    locations = tmplocs
    await sleep(5000)
  }
}

// load tw flags
twflags = {}
var lastline
fs.readFileSync('twflags.txt', 'utf8').split('\n').forEach(line => {
  var nummatch = line.match(/^== (\d+)/)
  if (nummatch) {
    var namematch = lastline.match(/[A-Z]+/)
    if (namematch) {
      twflags[nummatch[1]] = namematch[0]
    }
  }
  lastline = line
})

update_locations()
