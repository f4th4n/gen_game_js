// src/connection.ts
var Connection = class {
  constructor(host, port) {
    this.host = host;
    this.port = port;
    console.log("init", this.port);
  }
  authenticateDeviceAsync(deviceId) {
    console.log("this.host", this.host);
    console.log("this.port", this.port);
    console.log("deviceId", deviceId);
  }
};
var connection_default = Connection;

// src/game.ts
var Game = class {
  static async createMatch(connection) {
    console.log("match is created", connection);
    const match = {
      id: "something"
    };
    return match;
  }
};
var game_default = Game;

// src/gen_game.ts
var GenGame = class {
  static {
    this.version = "1.0.1";
  }
  constructor(host, port) {
    this.connection = new connection_default(host, port);
  }
  async createMatch() {
    const m = await game_default.createMatch(this.connection);
    return m;
  }
};
if (typeof globalThis != "undefined") {
  const glob = globalThis;
  glob.GenGame = GenGame;
}
var gen_game_default = GenGame;
export {
  GenGame,
  gen_game_default as default
};
