import Connection from './connection'
import Match from './match'

class Game {
  static async createMatch(connection: Connection) {
    console.log('match is created', connection)
    const match: Match = {
      id: 'something',
    }

    return match
  }
}

export default Game
