var fs = require('fs')
var ping = require('ping')
var debug = require('debug')('uniqueweb:serverstatus')

class ServerStatus {
  constructor (jsonPath) {
    this.path = jsonPath
    this.list = null
  }

  async startUpdating () {
    // Call also when starting
    this.updateStatus()
    // Then every x seconds
    setInterval(() => {
      this.updateStatus()
    }, parseFloat(process.env.SERVER_STATUS_UPDATE || 5) * 1000)
  }

  updateStatus () {
    fs.readFile(this.path, 'utf8', (err, data) => {
      if (err) debug(err)
      this.list = JSON.parse(data)
      for (var i in this.list) {
        let server = this.list[i]
        ping.promise.probe(server.ip).then((res) => {
          server.alive = res.alive
          server.ping = res.avg
          // debug(`${server.name} (${server.ip}) is alive: ${server.alive} ${server.ping} ms`)
        })
      }
    })
  }

  async getServerstatus () {
    // get serverstatus, see loc.ip and loc.servers
    for (var i in this.list) {
      let server = this.list[i]

      // Note: j is the property name, e.g j = 'race1'
      // This is for now a placeholder, all sv are same
      for (var j in server.servers) {
        let gameServer = server.servers[j]

        gameServer.reachable = true
        gameServer.map = 'run_blabla'
        gameServer.gametype = 'Race'
        gameServer.numclients = 3
        gameServer.maxclients = 32
        gameServer.players = [
          { name: 'timakro', clan: 'υηιqυє', flag: 'default', score: 19 },
          { name: 'Tezcan', clan: 'Yo xD', flag: 'DE', score: 19 },
          { name: 'Ryozuki', clan: 'hallo', flag: 'XCA', score: 19 }
        ]
      }
    }
    // dummy data
    /* if ('race1' in loc.servers) {
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
    } */
  }
}

module.exports = exports = ServerStatus
