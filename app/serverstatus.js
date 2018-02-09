var fs = require('fs')
var ping = require('ping')
var debug = require('debug')('uniqueweb:serverstatus')

class ServerStatus {
  constructor (jsonPath) {
    this.path = jsonPath
    this.list = null
    this.twFlags = null;
  }

  loadTWFlags () {
    this.twFlags = {}
    var lastLine
    var lines = fs.readFileSync('twflags.txt', 'utf8').split('\n')
    for (var i in lines) {
      var line = lines[i]
      var numMatch = line.match(/^== (\d+)/)
      if (numMatch) {
        var nameMatch = lastLine.match(/[A-Z]+/)
        if (nameMatch) {
          this.twFlags[numMatch[1]] = nameMatch[0]
        }
      }
      lastLine = line
    }
  }

  startUpdating () {
    this.loadTWFlags()
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
        ping.promise.probe(server.ip, {timeout: 2}).then((res) => {
          server.alive = res.alive
          server.ping = res.avg
          // debug(`${server.name} (${server.ip}) is alive: ${server.alive} ${server.ping} ms`)
          if (server.alive) {
            this.getServerstatus(server)
          }
        })
      }
    })
  }

  getServerstatus (server) {
    // Note: j is the property name, e.g j = 'race1'
    // This is for now a placeholder, all sv are same
    for (var j in server.servers) {
      let gameServer = server.servers[j]
      if (gameServer.name === 'OpenFNG') {
        gameServer.reachable = true
        gameServer.map = 'OpenFNG5beat'
        gameServer.numclients = 3
        gameServer.maxclients = 16
        gameServer.players = [
          { name: 'timakro', clan: 'υηιqυє', flag: 'default', score: 19 },
          { name: 'Tezcan', clan: 'Yo xD', flag: this.twFlags[203], score: 30 },
          { name: 'Ryozuki', clan: 'hallo', flag: this.twFlags[906], score: 19 }
        ]
      }
      if (gameServer.name === 'TeeSmash') {
        gameServer.reachable = true
        gameServer.map = 'smashDex'
        gameServer.numclients = 2
        gameServer.maxclients = 16
        gameServer.players = [
          { name: 'Tezcan', clan: 'Yo xD', flag: this.twFlags[203], score: 1 },
          { name: 'Ryozuki', clan: 'hallo', flag: this.twFlags[906], score: 19 }
        ]
      }
      if (gameServer.name === 'Fly') {
        gameServer.reachable = true
        gameServer.map = 'run_fast'
        gameServer.numclients = 5
        gameServer.maxclients = 16
        gameServer.players = [
          { name: 'Tezcan', clan: 'Yo xD', flag: this.twFlags[203], score: 19 },
          { name: 'Ryozuki', clan: 'hallo', flag: this.twFlags[96], score: 3 },
          { name: 'dcgu', clan: '', flag: this.twFlags[8], score: 19 },
          { name: 'Freezestyler', clan: 'roguelike', flag: this.twFlags[533], score: 7 },
          { name: 'Men Of Steel', clan: 'Awesome', flag: this.twFlags[166], score: 19 }
        ]
      }
      if (gameServer.name === 'Football') {
        gameServer.reachable = true
        gameServer.map = 'teefoot1'
        gameServer.numclients = 0
        gameServer.maxclients = 16
      }
      if (gameServer.name === 'Race 1') {
        gameServer.reachable = true
        gameServer.map = 'run_orange'
        gameServer.numclients = 8
        gameServer.maxclients = 64
        gameServer.players = [
          { name: 'AAAAAAAAAAAAAAA', clan: 'AAAAAAAAAAAAAAA', flag: 'default', score: '23:23.333' },
          { name: 'nameless tee', clan: '', flag: 'default', score: 0 },
          { name: 'nameless tee', clan: '', flag: 'default', score: 0 },
          { name: 'nameless tee', clan: '', flag: 'default', score: 0 },
          { name: 'nameless tee', clan: '', flag: 'default', score: 0 },
          { name: 'nameless tee', clan: '', flag: 'default', score: 0 },
          { name: 'nameless tee', clan: '', flag: 'default', score: 0 },
          { name: 'nameless tee', clan: '', flag: 'default', score: 0 }
        ]
      }
      if (gameServer.name === 'Race 2') {
        gameServer.reachable = true
        gameServer.map = 'run_greeen'
        gameServer.numclients = 5
        gameServer.maxclients = 64
        gameServer.players = [
          { name: 'nameless tee', clan: '', flag: 'default', score: 0 },
          { name: 'nameless tee', clan: '', flag: 'default', score: 0 },
          { name: 'nameless tee', clan: '', flag: 'default', score: 0 },
          { name: 'nameless tee', clan: '', flag: 'default', score: 0 },
          { name: 'nameless tee', clan: '', flag: 'default', score: 0 }
        ]
      }
      if (gameServer.name === 'Instagib') {
        gameServer.reachable = true
        gameServer.map = 'dark_laser'
        gameServer.numclients = 15
        gameServer.maxclients = 16
        gameServer.players = [
          { name: 'nameless tee', clan: '', flag: 'default', score: 0 },
          { name: 'nameless tee', clan: '', flag: 'default', score: 0 },
          { name: 'nameless tee', clan: '', flag: 'default', score: 0 },
          { name: 'nameless tee', clan: '', flag: 'default', score: 0 },
          { name: 'nameless tee', clan: '', flag: 'default', score: 0 },
          { name: 'nameless tee', clan: '', flag: 'default', score: 0 },
          { name: 'nameless tee', clan: '', flag: 'default', score: 0 },
          { name: 'nameless tee', clan: '', flag: 'default', score: 0 },
          { name: 'nameless tee', clan: '', flag: 'default', score: 0 },
          { name: 'nameless tee', clan: '', flag: 'default', score: 0 },
          { name: 'nameless tee', clan: '', flag: 'default', score: 0 },
          { name: 'nameless tee', clan: '', flag: 'default', score: 0 },
          { name: 'nameless tee', clan: '', flag: 'default', score: 0 },
          { name: 'nameless tee', clan: '', flag: 'default', score: 0 },
          { name: 'nameless tee', clan: '', flag: 'default', score: 0 }
        ]
      }
      if (gameServer.name === 'SoloFNG') {
        gameServer.reachable = true
        gameServer.map = 'openfng2'
        gameServer.numclients = 0
        gameServer.maxclients = 16
      }
      if (gameServer.name === 'BoomFNG 1') {
        gameServer.reachable = true
        gameServer.map = 'openfng5'
        gameServer.numclients = 7
        gameServer.maxclients = 16
        gameServer.players = [
          { name: 'nameless tee', clan: '', flag: 'default', score: 0 },
          { name: 'nameless tee', clan: '', flag: 'default', score: 0 },
          { name: 'nameless tee', clan: '', flag: 'default', score: 0 },
          { name: 'nameless tee', clan: '', flag: 'default', score: 0 },
          { name: 'nameless tee', clan: '', flag: 'default', score: 0 },
          { name: 'nameless tee', clan: '', flag: 'default', score: 0 },
          { name: 'nameless tee', clan: '', flag: 'default', score: 0 }
        ]
      }
      if (gameServer.name === 'BoomFNG 2') {
        gameServer.map = 'dm1'
        gameServer.reachable = true
        gameServer.numclients = 0
        gameServer.maxclients = 16
      }
      if (gameServer.name === 'Bomb') {
        gameServer.map = 'BombGarden'
        gameServer.reachable = true
        gameServer.numclients = 0
        gameServer.maxclients = 16
      }
    }
  }
}

module.exports = exports = ServerStatus
