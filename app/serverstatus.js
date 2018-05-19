var fs = require('fs')
var ping = require('ping').promise
var debug = require('debug')('uniqueweb:serverstatus')
var getServerInfo = require('teeworlds-server-status').getServerInfo

class ServerStatus {
  constructor (jsonPath) {
    this.path = jsonPath
    this.list = null
    this.twFlags = null
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
    fs.readFile(this.path, 'utf8', async (err, data) => {
      if (err) debug(err)

      let newlist = JSON.parse(data)
      
      for (var i in this.list) {
        let server = this.list[i]

        let res = await ping.probe(server.ip, {timeout: 2});

        server.alive = res.alive;
        server.ping = res.avg;

        if (server.alive) {
          this.getServerstatus(server)
        }
      }

      this.list = newlist
    })
  }

  getServerstatus (server) {
    for (var i in server.servers) {
      let gameServer = server.servers[i]
      getServerInfo(server.ip, parseInt(gameServer.port), (svInfo) => {
        gameServer.reachable = true
        gameServer.map = svInfo.map
        gameServer.maxclients = svInfo.maxClientCount
        gameServer.players = svInfo.clients
          .filter(p => p.name !== '(connecting)')
          .sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1)
        gameServer.password = svInfo.password

        for (var ply in gameServer.players) {
          if (gameServer.players[ply].country in this.twFlags) {
            gameServer.players[ply].flag = this.twFlags[gameServer.players[ply].country]
          } else {
            gameServer.players[ply].flag = 'default'
          }
        }
      })
    }
  }
}

module.exports = exports = ServerStatus
