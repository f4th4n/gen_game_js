class GenGame {
  static version = '1.0.1'
}

// --------------------------------------------------------------------------------- expose

const globalAny: any = global

module.exports = GenGame
globalAny.GenGame = GenGame
