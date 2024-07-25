// src/client.ts
var Client = class {
  greet() {
    console.log("from method greet...");
  }
  static test() {
    console.log("from static method test...");
  }
};
var client_default = Client;

// src/gen_game.ts
var GenGame = class {
  static {
    this.version = "1.0.1";
  }
  static hello() {
    console.log("hello");
    return false;
  }
};
if (typeof globalThis != "undefined") {
  const glob = globalThis;
  glob.Client = client_default;
  glob.GenGame = GenGame;
}
var gen_game_default = GenGame;
export {
  client_default as Client,
  GenGame,
  gen_game_default as default
};
