import Connection from './connection'
import Match from './match'
import { GenGameState } from './types'

interface Game {
  state: any
}

class Game {
  static async createMatch(connection: Connection, genGameState: GenGameState): Promise<Match> {
    // TODO implement query
    const { channel } = await Connection.joinChannel(connection, 'gen_game', { token: connection.token })
    const resMatch = (await Connection.send(channel, 'create_match', {})) as unknown as Match
    await this._joinChannel(connection, resMatch)

    genGameState.match = resMatch

    return resMatch
  }

  static async onChangeState(connection: Connection, match: Match | undefined, callback: Function) {
    const { channel } = await this._joinChannel(connection, match)

    channel.on('relay', function (msg) {
      callback(msg)
    })
  }

  static async setState(connection: Connection, match: Match | undefined, payload: object) {
    const { channel } = await this._joinChannel(connection, match)

    await Connection.send(channel, 'set_state', payload, false)
  }

  private static async _joinChannel(connection: Connection, match: Match | undefined) {
    if (!match) {
      throw new Error(`[GenGame] no match found. Please create or join match before calling GenGame.setState()`)
    }

    const topic = `game:${match.match_id}`
    const params = { token: connection.token }
    const channel = await Connection.joinChannel(connection, topic, params)
    return channel
  }
}

export default Game
