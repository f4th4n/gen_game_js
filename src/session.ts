import Connection from './connection'

interface Session {
  token: string
}

class Session {
  static async authenticateDevice(connection: Connection, deviceId: string) {
    // TODO return session with type Session
    const { channel } = await Connection.joinChannel(connection, 'public')
    const { token } = (await Connection.send(channel, 'create_session', { username: deviceId })) as unknown as Session
    Connection.setToken(connection, token)

    return token
  }
}

export default Session
