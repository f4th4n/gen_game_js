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

    return Session.oauthFlow(connection, 'google', { link_mode: 'true', token })
  }

  static async unlinkGoogle(connection: Connection): Promise<any> {
    Connection.guard(connection)
    
    const { channel } = await Connection.joinChannel(connection, 'gen_game', { token: connection.token })
    const response = await Connection.send(channel, 'unlink_oauth_provider', { provider: 'google' })
    
    return response
  }

  static async getLinkedProviders(connection: Connection): Promise<any> {
    Connection.guard(connection)
    
    const { channel } = await Connection.joinChannel(connection, 'gen_game', { token: connection.token })
    const response = await Connection.send(channel, 'list_oauth_links', {})
    
    return response
  }

  static async authenticateGoogle(connection: Connection): Promise<any> {
    Connection.guard(connection)
    
    return Session.oauthFlow(connection, 'google')
  }

  private static async oauthFlow(connection: Connection, provider: string, params: Record<string, string> = {}): Promise<any> {
    // Ensure we have a token
    if (!connection.token) {
      throw new Error('Connection token is required for OAuth flow')
    }

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
    
    // Add the current token to params for PubSub notification
    const allParams = { ...params, token: connection.token }
    
    // Construct HTTP URL for OAuth endpoint
    const queryParams = new URLSearchParams(allParams).toString()
    const url = `${baseUrl}/auth/${provider}${queryParams ? '?' + queryParams : ''}`
    
    console.log('Final OAuth URL:', url)

    // Use existing gen_game channel if available, otherwise join it
    let channel = connection.channels.get('gen_game')
    if (!channel) {
      const joinResult = await Connection.joinChannel(connection, 'gen_game', { token: connection.token })
      channel = joinResult.channel
    }
    console.log('Using existing or joined gen_game channel for OAuth flow:', channel)
    
    return new Promise((resolve, reject) => {
      // Open in new tab instead of popup window
      const newTab = window.open(url, '_blank')
      
      if (!newTab) {
        reject(new Error('Tab blocked. Please allow popups/new tabs for OAuth authentication.'))
        return
      }

      console.log('OAuth tab opened successfully')
      let resultRef: number

      // Listen for OAuth result push from WebSocket
      const oauthResultHandler = (payload: any) => {
        console.log('OAuth result received via WebSocket:', payload)
        
        // Remove the event handler
        channel.off('oauth_result', resultRef)
        
        // Don't auto-close the tab - let user close it themselves
        console.log('OAuth completed, user can close the tab manually')
        
        if (payload.success) {
          console.log('OAuth success, resolving with:', payload)
          resolve(payload)
        } else {
          console.log('OAuth error, rejecting with:', payload.msg || payload.error)
          reject(new Error(payload.msg || payload.error || 'OAuth authentication failed'))
        }
      }

      resultRef = channel.on('oauth_result', oauthResultHandler)
    })
  }
}

export default Session
