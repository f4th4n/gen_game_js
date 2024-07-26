import Connection from './connection'
import Game from './game'
import Match from './match'
import Session from './session'

class GenGame {
  connection: Connection

  static version = '1.0.3'

  constructor(host: string, port: number, protocol: string = 'http') {
    this.connection = new Connection(host, port, protocol)
  }

  async connect(): Promise<void> {
    return await Connection.connect(this.connection)
  }

  async authenticateDevice(deviceId: string) {
    return Session.authenticateDevice(this.connection, deviceId)
  }

  async createMatch(): Promise<Match> {
    return await Game.createMatch(this.connection)
  }
}

// --------------------------------------------------------------------------------- expose

if (typeof global != 'undefined') {
  const glob: any = global
  glob.GenGame = GenGame
}

export { GenGame }
export default GenGame
