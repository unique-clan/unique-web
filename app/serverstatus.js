var fs = require('fs');
var ping = require('ping').promise;
var debug = require('debug')('uniqueweb:serverstatus');
const ServerHandler = require('teeworlds-server-status').ServerHandler;
var twFlags = null;

var serverList = JSON.parse(fs.readFileSync(process.env.SERVERS_LOCATION || 'servers.json', 'utf8'));

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
  constructor() {
    this.list = [];
  }

  async startUpdating() {
    loadTWFlags();
    while(true) {
      await this.updateStatus(); // TODO: set a timeout on server status module
      debug("test")
      this.list = serverList;
      await this.sleep((process.env.SERVER_STATUS_UPDATE || 5) * 1000);
    }
  }

  async updateStatus() {
    debug("callled")
    for(var server of serverList) {
      var result = {};
      var res = await ping.probe(server.ip, { timeout: 2 });
      server.alive = res.alive;
      server.ping = res.avg;

      if (server.alive || true) {
        await this.getServerstatus(server);
        debug("done")
      }
    }
  }

  sleep(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }

  /**
   * This functions gets a reference and modifies it. (Objects in js are passed by reference)
   * @param {*} server
   */
  async getServerstatus(server) {
    for (var gameServer of server.servers) {
      const handler = new ServerHandler(server.ip, parseInt(gameServer.port), true);
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
      debug("ok")
      await this.sleep(10);
    }
  }
}

module.exports = exports = ServerStatus;
