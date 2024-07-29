import { Socket, Channel, Push } from 'phoenix'
import { Message } from './types'
import { chownSync } from 'fs'

/*
available topics:
- public
- gen_game
- game:$match_id
*/

type Channels = { [key: string]: Channel }

class Connection {
  socket: Socket
  token: string | undefined
  channels: Map<string, Channel> = new Map()

  constructor(host: string, port: number, protocol: string) {
    const endpoint = `${protocol}://${host}:${port}/game`
    this.socket = new Socket(endpoint)
  }

  static async connect(connection: Connection): Promise<void> {
    return new Promise((resolve) => {
      connection.socket.connect()
      connection.socket.onOpen(resolve)
    })
  }

  static async joinChannel(
    connection: Connection,
    topic: string,
    chanParams: object = {}
  ): Promise<{ channel: Channel; response: Message }> {
    return new Promise((resolve, reject) => {
      const existingChannel = connection.channels.get(topic)
      if (existingChannel) {
        return resolve({ channel: existingChannel, response: {} })
      }

      const channel = connection.socket.channel(topic, chanParams)

      channel
        .join()
        .receive('ok', (response) => {
          connection.channels.set(topic, channel)
          return resolve({ channel, response })
        })
        .receive('error', (response) => reject(response))
    })
  }

  static async send(
    channel: Channel,
    event: string,
    payload: object,
    withReply: boolean = true
  ): Promise<Message | null> {
    return new Promise((resolve, reject) => {
      const res = channel.push(event, payload)
      if (!withReply) return resolve(null)

      res.receive('ok', (response) => resolve(response)).receive('error', (response) => reject(response))
    })
  }

  static setToken(connection: Connection, token: string) {
    connection.token = token
  }

  /**
   * Make sure connection is established, or throw an error
   * @param connection
   */
  public static guard(connection: Connection) {
    if (!connection.socket.isConnected())
      throw new Error('[GenGame] socket is not connected yet. To connect: genGame.connect()')
  }
}

export default Connection
