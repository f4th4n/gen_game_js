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

  static async createAccount(connection: Connection, params: { username: string; display_name?: string; [key: string]: any }) {
    Connection.guard(connection)
    
    const { channel } = await Connection.joinChannel(connection, 'gen_game', { token: connection.token })
    const account = await Connection.send(channel, 'create_account', params)
    
    return account
  }

  static async linkGoogle(connection: Connection, token: string): Promise<any> {
    Connection.guard(connection)

    return Session.oauthPopupFlow(connection, 'google', { link_mode: 'true', token })
  }

  static async authenticateGoogle(connection: Connection): Promise<any> {
    Connection.guard(connection)
    
    return Session.oauthPopupFlow(connection, 'google')
  }

  private static async oauthPopupFlow(connection: Connection, provider: string, params: Record<string, string> = {}): Promise<any> {
    // Extract base URL from WebSocket endpoint and construct HTTP OAuth URL
    const wsUrl = connection.socket.endPointURL()
    console.log('WebSocket URL:', wsUrl)
    
    // WebSocket URL format: "http://localhost:4000/game/websocket?vsn=2.0.0"
    // We need: "http://localhost:4000/auth/google"
    const urlMatch = wsUrl.match(/^(https?:\/\/[^\/]+)/)
    if (!urlMatch) {
      console.error('Failed to parse WebSocket URL:', wsUrl)
      throw new Error(`Invalid WebSocket URL: ${wsUrl}`)
    }
    
    const baseUrl = urlMatch[1]
    
    console.log('Extracted base URL:', baseUrl)
    
    // Construct HTTP URL for OAuth endpoint
    const queryParams = new URLSearchParams(params).toString()
    const url = `${baseUrl}/auth/${provider}${queryParams ? '?' + queryParams : ''}`
    
    console.log('Final OAuth URL:', url)
    
    return new Promise((resolve, reject) => {
      const popup = window.open(url, 'oauth', 'width=500,height=600,scrollbars=yes,resizable=yes')
      
      if (!popup) {
        reject(new Error('Popup blocked. Please allow popups for OAuth authentication.'))
        return
      }

      console.log('OAuth popup opened successfully')

      const messageHandler = (event: MessageEvent) => {
        console.log('OAuth popup message received:', event.data, 'from origin:', event.origin)
        
        // Security: Verify origin matches our server
        const expectedOrigin = baseUrl
        if (event.origin !== expectedOrigin) {
          console.log('Origin mismatch. Expected:', expectedOrigin, 'Got:', event.origin)
          return
        }

        const data = event.data
        if (data && (data.success !== undefined || data.error)) {
          console.log('Valid OAuth response received:', data)
          window.removeEventListener('message', messageHandler)
          clearInterval(checkClosed)
          popup.close()
          
          if (data.success) {
            console.log('OAuth success, resolving with:', data)
            resolve(data)
          } else {
            console.log('OAuth error, rejecting with:', data.message || data.error)
            reject(new Error(data.message || data.error || 'OAuth authentication failed'))
          }
        } else {
          console.log('Received message without success/error fields:', data)
        }
      }

      window.addEventListener('message', messageHandler)

      // Check if popup is closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed)
          window.removeEventListener('message', messageHandler)
          reject(new Error('OAuth authentication was cancelled'))
        }
      }, 1000)
    })
  }
}

export default Session
