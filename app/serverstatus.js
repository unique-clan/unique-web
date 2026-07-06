var fs = require("fs");
var debug = require("debug")("uniqueweb:serverstatus");
var https = require("https");
var NodeCache = require("node-cache");

// Define locations and their sponsors
const LOCATIONS = [
    { name: "GER" },
    { name: "CAN", sponsor: "Fudgy" },
    { name: "USA", sponsor: "Ewan" },
];

class ServerStatus {
    constructor() {
        this.locations = LOCATIONS;
        this.twFlags = {};
        this.masterServerUrl = "https://master1.ddnet.org/ddnet/15/servers.json";
        this.targetCommunity = "unique";
        // Cache for 30 seconds (stdTTL in seconds)
        this.cache = new NodeCache({ stdTTL: 30 });
        this.loadTWFlags();
    }

    loadTWFlags() {
        var lastLine;
        var lines = fs.readFileSync("public/img/twflags/index.txt", "utf8").split("\n");
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

    async fetchMasterServerData() {
        return new Promise((resolve, reject) => {
            https.get(this.masterServerUrl, (res) => {
                let data = "";
                
                res.on("data", (chunk) => {
                    data += chunk;
                });
                
                res.on("end", () => {
                    try {
                        const parsed = JSON.parse(data);
                        resolve(parsed);
                    } catch (err) {
                        reject(err);
                    }
                });
            }).on("error", (err) => {
                reject(err);
            });
        });
    }

    parseServerAddress(address) {
        const match = address.match(/^(.+):(\d+)$/);
        if (!match) return null;
        return {
            ip: match[1],
            port: parseInt(match[2])
        };
    }

    getLocationFromName(serverName) {
        // Try to extract location from server name (e.g., "GER" from "Unique Race GER")
        for (const loc of this.locations) {
            if (serverName.includes(loc.name)) {
                return loc.name;
            }
        }
        return null;
    }

    async getServerList() {
        // Check cache first
        const cached = this.cache.get("serverList");
        if (cached) {
            return cached;
        }
        
        try {
            const masterData = await this.fetchMasterServerData();
            
            // Initialize location data
            const locationMap = {};
            for (const loc of this.locations) {
                locationMap[loc.name] = {
                    name: loc.name,
                    sponsor: loc.sponsor,
                    servers: []
                };
            }

            // Process servers from master server
            if (masterData.servers) {
                for (const server of masterData.servers) {
                    // Filter by community field
                    if (server.community && server.community === this.targetCommunity) {
                        
                        const location = this.getLocationFromName(server.info.name || "");
                        if (location && locationMap[location]) {
                            const addrInfo = this.parseServerAddress(server.addresses[0] || "");
                            
                            if (addrInfo && server.info && server.info.map) {
                                const processedServer = {
                                    name: server.info.name,
                                    ip: addrInfo.ip.replace(/^tw-0.6\+udp:\/\//, ""),
                                    port: addrInfo.port,
                                    map: server.info.map.name,
                                    maxclients: server.info.max_clients,
                                    players: (server.info.clients || []).map(client => ({
                                        name: client.name,
                                        clan: client.clan || "",
                                        country: client.country,
                                        flag: this.twFlags[client.country] || "default"
                                    })).sort((a, b) => 
                                        a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
                                    ),
                                    password: server.info.passworded || false,
                                };
                                
                                locationMap[location].servers.push(processedServer);
                            }
                        }
                    }
                }
            }

            const serverList = Object.values(locationMap);
            
            // Store in cache
            this.cache.set("serverList", serverList);
                        
            return serverList;
        } catch (err) {
            debug("Failed to fetch server status: %s", err);
            // Return empty location structure on error
            return this.locations.map(loc => ({
                name: loc.name,
                sponsor: loc.sponsor,
                servers: []
            }));
        }
    }
}

module.exports = exports = ServerStatus;
