import Connection from './connection'
import Match from './match'

interface GenGameState {
  connection: Connection
  match?: Match
}

interface Message {
  [key: string]: string
}

export { GenGameState, Message }
