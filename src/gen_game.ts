import Connection from './connection'
import Game from './game'
import Match from './match'

class GenGame {
  connection: Connection

  static version = '1.0.1'

  constructor(host: string, port: number) {
    this.connection = new Connection(host, port)
  }

  async createMatch(): Promise<Match> {
    const m = await Game.createMatch(this.connection)
    return m
  }
}

// --------------------------------------------------------------------------------- expose

if (typeof global != 'undefined') {
  const glob: any = global
  glob.GenGame = GenGame
}

export { GenGame }
export default GenGame
