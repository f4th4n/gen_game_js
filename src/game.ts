import Connection from './connection'
import Match from './match'

class Game {
  static async createMatch(connection: Connection, _query: any = null): Promise<Match> {
    // TODO implement query
    const { channel } = await Connection.joinChannel(connection, 'gen_game', { token: connection.token })
    const match: Match = (await Connection.send(channel, 'create_match', {})) as unknown as Match

    return match
  }
}

export default Game
