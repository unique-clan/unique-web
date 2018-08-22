var fs = require('fs');
var ping = require('ping').promise;
var debug = require('debug')('uniqueweb:serverstatus');
const ServerHandler = require('teeworlds-server-status').ServerHandler;
var twFlags = null;

function loadTWFlags() {
  twFlags = {};
  var lastLine;
  var lines = fs.readFileSync('twflags.txt', 'utf8').split('\n');
  for (var i in lines) {
    var line = lines[i];
    var numMatch = line.match(/^== (\d+)/);
    if (numMatch) {
      var nameMatch = lastLine.match(/[A-Z]+/);
      if (nameMatch) {
        twFlags[numMatch[1]] = nameMatch[0];
      }
    }
    lastLine = line;
  }
}

class ServerStatus {
  constructor(jsonPath) {
    this.path = jsonPath;
    this.list = [];
  }

  startUpdating() {
    loadTWFlags();
    // Call also when starting
    this.updateStatus();
    // Then every x seconds
    setInterval(async () => {
      this.updateStatus();
    }, parseFloat(process.env.SERVER_STATUS_UPDATE || 5) * 1000);
  }

  async updateStatus() {
    const data = fs.readFileSync(this.path, 'utf8');
    let svlist = JSON.parse(data);

    let promises = [];
    for (let server of svlist) {
      try {
        let res = await ping.probe(server.ip, { timeout: 2 });

        server.alive = res.alive;
        server.ping = res.avg;

        if (server.alive) {
          await this.getServerstatus(server);
        }
      } catch(e) {
        debug(e);
      }
    }

    this.list = svlist;
  }

  async getServerstatus(server) {
    let promises = [];
    for (var i in server.servers) {
      let gameServer = server.servers[i];
      promises.push(async () => {
        const handler = new ServerHandler(gameServer.ip, parseInt(gameServer.port), true);
        const info = await handler.requestInfo();
        gameServer.reachable = true;
        gameServer.map = info.map;
        gameServer.maxclients = info.maxClientCount;
        gameServer.password = info.password;
        gameServer.players = info.clients
          .filter(p => p.name !== '(connecting)')
          .sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1);

        for (var ply in gameServer.players) {
          if (gameServer.players[ply].country in twFlags) {
            gameServer.players[ply].flag = twFlags[gameServer.players[ply].country];
          } else {
            gameServer.players[ply].flag = 'default';
          }
        }
      });
    }
    return await Promise.all(promises);
  }
}

module.exports = exports = ServerStatus;
