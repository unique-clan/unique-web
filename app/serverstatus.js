var fs = require('fs');
var ping = require('ping').promise;
var debug = require('debug')('uniqueweb:serverstatus');
var util = require('util');
var ServerHandler = require('teeworlds-server-status').ServerHandler;

const sleep = util.promisify(setTimeout);
const readFile = util.promisify(fs.readFile);

class ServerStatus {

  constructor (jsonPath) {
    this.path = jsonPath;
    this.list = null;
    this.twFlags = {};
  }

  loadTWFlags () {
    var lastLine;
    var lines = fs.readFileSync('twflags.txt', 'utf8').split('\n');
    for (var i in lines) {
      var line = lines[i];
      var numMatch = line.match(/^== (\d+)/);
      if (numMatch) {
        var nameMatch = lastLine.match(/[A-Z]+/);
        if (nameMatch) {
          this.twFlags[numMatch[1]] = nameMatch[0];
        }
      }
      lastLine = line;
    }
  }

  async updateStatus () {
    this.loadTWFlags();
    while (true) {
      let svlist = JSON.parse(await readFile(this.path, 'utf8'));
      let tasks = Object.values(svlist).map(loc => this.updateLocation(loc));
      await Promise.all(tasks);
      this.list = svlist;
      await sleep(parseFloat(process.env.SERVER_STATUS_UPDATE || 5) * 1000);
    }
  }

  async updateLocation (location) {
    let res = await ping.probe(location.ip, {timeout: 1});

    location.alive = res.alive;
    location.ping = res.avg;

    if (location.alive) {
      let tasks = Object.values(location.servers).map(srv => this.updateGameserver(srv, location.ip));
      await Promise.all(tasks);
    }
  }

  async updateGameserver (server, ip) {
    try {
      let svInfo = await new ServerHandler(ip, server.port, false, 1000).requestInfo();

      server.reachable = true;
      server.map = svInfo.map;
      server.maxclients = svInfo.maxClientCount;
      server.players = svInfo.clients
        .filter(p => p.name !== '(connecting)')
        .sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1);
      server.password = svInfo.password;

      for (var player of server.players) {
        if (player.country in this.twFlags)
          player.flag = this.twFlags[player.country];
        else
          player.flag = 'default';
      }
    }
    catch (err) {
      server.reachable = false;
    }
  }
}

module.exports = exports = ServerStatus;
