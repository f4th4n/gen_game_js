import Connection from './connection'

class Session {
  static async authenticateDevice(connection: Connection, deviceId: string) {
    const { channel } = await Connection.joinChannel(connection, 'public')
    const { token } = await Connection.send(channel, 'create_session', { username: deviceId })
    Connection.setToken(connection, token)

    return token
  }
}

export default Session
