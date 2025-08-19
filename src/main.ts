// !!!!!! WARNING !!!!!!
// this file is used only for development purpose

import { GenGame } from './gen_game'
import Connection from './connection'

const genGame = new GenGame('localhost', 4000)

await genGame.connect()

// Example workflow for OAuth integration
let deviceToken: string
let accountToken: string
let currentAccount: any = null
let linkedProviders: string[] = []

// Helper functions
const isTemporaryAccount = (token: string) => {
  // Device tokens are for temporary usernames like 'kopi'
  // Account tokens are for real usernames
  return token === deviceToken
}

const checkAccountGoogleLinkStatus = async () => {
  if (!accountToken) return false
  
  try {
    const { channel } = await Connection.joinChannel(genGame.state.connection, 'gen_game', { token: accountToken })
    const result = await Connection.send(channel, 'list_oauth_links', {})
    linkedProviders = (result as any)?.linked_providers || []
    return linkedProviders.includes('google')
  } catch (error) {
    console.error('Failed to check OAuth links:', error)
    return false
  }
}

// Initialize with device token for now
deviceToken = await genGame.authenticateDevice('kopi')
console.log('Initial device token:', deviceToken)

const listenGameChangeState = () => {
  genGame.onChangeState((payload: any) => {
    $('#messages').append(`<p>${payload.move_x}</p>`)
  })
}

// Update button states based on token availability
const updateButtonStates = async () => {
  const linkButton = $('#link-google')
  
  if (!accountToken) {
    if (deviceToken) {
      linkButton.prop('disabled', true).text('Link Google (Create Account First)')
    } else {
      linkButton.prop('disabled', true).text('Link Google (No Token)')
    }
    return
  }
  
  // Check if Google is already linked
  const isGoogleLinked = await checkAccountGoogleLinkStatus()
  
  if (isGoogleLinked) {
    linkButton.prop('disabled', true).text('Link Google (Already Linked)')
  } else {
    linkButton.prop('disabled', false).text('Link Google')
  }
}

$('#create-game').on('click', async () => {
  const match = await genGame.createMatch()

  listenGameChangeState()

  $('#screen-1').hide()
  $('#screen-2').show()
  $('#game-room').html(match.match_id)
})

$('#join-game').on('click', async () => {
  const matchId = $('#match-id').val()?.toString()
  if (!matchId) return

  const match = await genGame.joinMatch(matchId)

  listenGameChangeState()

  $('#screen-1').hide()
  $('#screen-2').show()
  $('#game-room').html(match.match_id)
})

$('#send-random-msg').on('click', async () => {
  const rand = Math.floor(Math.random() * 1000000) + 1
  await genGame.setState({ move_x: rand })
})

// Add buttons for testing OAuth flow
$(document).ready(async () => {
  $('body').append(`
    <div style="margin: 20px; padding: 20px; border: 1px solid #ccc;">
      <h3>OAuth Testing</h3>
      <div style="margin-bottom: 10px;">
        <label>Username: <input type="text" id="username-input" placeholder="Enter username" value="testuser" /></label>
      </div>
      <button id="create-account">Create Account</button>
      <button id="link-google">Link Google</button>
      <button id="auth-google">Authenticate Google</button>
      <div id="oauth-status"></div>
    </div>
  `)

  // Initialize button states
  await updateButtonStates()
  
  $('#create-account').on('click', async () => {
    try {
      const username = $('#username-input').val()?.toString().trim()
      if (!username) {
        $('#oauth-status').html('<p>Error: Please enter a username</p>')
        return
      }
      
      const account = await genGame.createAccount({
        username: username,
        display_name: username
      })
      $('#oauth-status').html('<p>Account created: ' + JSON.stringify(account) + '</p>')
      
      // Create session token for the new account
      console.log('Creating session for account:', username)
      const { channel } = await Connection.joinChannel(genGame.state.connection, 'public')
      const { token } = await Connection.send(channel, 'create_session', { username: username })
      accountToken = token
      console.log('Account token created:', accountToken)
      
      // Update UI to show we have an account token
      $('#oauth-status').append('<p>Account token created for linking</p>')
      await updateButtonStates()
      
    } catch (error:any) {
      console.error('Create account error:', error)
      $('#oauth-status').html('<p>Error: ' + error.message + '</p>')
    }
  })

  $('#link-google').on('click', async () => {
    if (!accountToken) {
      $('#oauth-status').html('<p>Error: No account token available. Please create account first.</p>')
      return
    }
    
    // Check if already linked
    const isAlreadyLinked = await checkAccountGoogleLinkStatus()
    if (isAlreadyLinked) {
      $('#oauth-status').html('<p>Error: Google is already linked to this account.</p>')
      return
    }
    
    console.log('Linking Google with account token:', accountToken)
    
    try {
      const result = await genGame.linkGoogle(accountToken)
      console.log('Link result:', result)
      $('#oauth-status').html('<p>Google linked successfully!</p>')
      $('#oauth-status').append('<p>Result: ' + JSON.stringify(result) + '</p>')
      
      // Refresh button states
      await updateButtonStates()
    } catch (error:any) {
      console.error('Link error:', error)
      $('#oauth-status').html('<p>Link error: ' + error.message + '</p>')
    }
  })

  $('#auth-google').on('click', async () => {
    console.log('Auth Google button clicked')
    $('#oauth-status').html('<p>Opening Google authentication popup...</p>')
    
    try {
      console.log('Calling genGame.authenticateGoogle()')
      const result = await genGame.authenticateGoogle()
      console.log('Google auth result:', result)
      
      if (result && result.success && result.token) {
        console.log('Authentication successful, setting token')
        // Set the new token in the connection
        Connection.setToken(genGame.state.connection, result.token)
        accountToken = result.token
        currentAccount = result.account
        
        $('#oauth-status').html('<p>Google auth successful! Token: ' + result.token.substring(0, 20) + '...</p>')
        $('#oauth-status').append('<p>Account: ' + JSON.stringify(result.account) + '</p>')
        
        await updateButtonStates()
      } else {
        console.log('Authentication failed or missing data:', result)
        $('#oauth-status').html('<p>Google auth failed: ' + ((result && result.message) || 'Unknown error') + '</p>')
      }
    } catch (error:any) {
      console.error('Google auth error:', error)
      $('#oauth-status').html('<p>Auth error: ' + error.message + '</p>')
    }
  })
})
