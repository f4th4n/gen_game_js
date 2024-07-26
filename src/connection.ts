import { Socket, Channel, Push } from 'phoenix'

/*
available topics:
- public
- gen_game
- game:$match_id
*/

interface Message {
  [key: string]: string
}

class Connection {
  socket: Socket
  token: string | undefined

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
      const channel = connection.socket.channel(topic, chanParams)

      channel
        .join()
        .receive('ok', (response) => resolve({ channel, response }))
        .receive('error', (response) => reject(response))
    })
  }

  static async send(channel: Channel, event: string, payload: object): Promise<Message> {
    return new Promise((resolve, reject) => {
      channel
        .push(event, payload)
        .receive('ok', (response) => resolve(response))
        .receive('error', (response) => reject(response))
    })
  }

  static setToken(connection: Connection, token: string) {
    connection.token = token
  }

  /**
   * Make sure connection is established, or throw an error
   * @param connection
   */
  private static guard(connection: Connection) {
    if (!connection.socket.isConnected())
      throw new Error('[GenGame] socket is not connected yet. To connect: genGame.connect()')
  }
}

export default Connection
