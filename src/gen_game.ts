import Connection from './connection'
import Game from './game'
import Match from './match'
import Session from './session'
import { GenGameState } from './types'

class GenGame {
  state: GenGameState

  static version = '1.0.4'

  constructor(host: string, port: number, protocol: string = 'http') {
    this.state = {
      connection: new Connection(host, port, protocol),
    }
  }

  async connect(): Promise<void> {
    return Connection.connect(this.state.connection)
  }

  async authenticateDevice(deviceId: string): Promise<any> {
    return Session.authenticateDevice(this.state.connection, deviceId)
  }

  async createMatch(): Promise<Match> {
    // @mutate this.state.match
    return Game.createMatch(this.state.connection, this.state)
  }

  async joinMatch(matchId: string): Promise<Match> {
    // @mutate this.state.match
    return Game.joinMatch(this.state.connection, this.state, matchId)
  }

  onChangeState(callback: Function) {
    return Game.onChangeState(this.state.connection, this.state.match, callback)
  }

  setState(payload: object) {
    return Game.setState(this.state.connection, this.state.match, payload)
  }
}

// --------------------------------------------------------------------------------- expose

if (typeof global != 'undefined') {
  const glob: any = global
  glob.GenGame = GenGame
}

export { GenGame }
export default GenGame
