// !!!!!! WARNING !!!!!!
// this file is used only for development purpose

import { GenGame } from './gen_game'
import Connection from './connection'

const DEFAULT_USERNAME = 'kopi'

const genGame = new GenGame('localhost', 4000)

await genGame.connect()

// Example workflow for OAuth integration
let deviceToken: string
let accountToken: string
let currentAccount: any = null
let linkedProviders: string[] = []
let currentLoginState = {
  username: DEFAULT_USERNAME,
  hasAccount: false,
  isLoggedIn: false
}

const updateLoginState = (username: string, hasAccount: boolean, isLoggedIn: boolean) => {
  currentLoginState = { username, hasAccount, isLoggedIn }
  updateLoginDisplay()
}

const updateLoginDisplay = () => {
  const loginDiv = $('#login-state')
  const statusColor = currentLoginState.isLoggedIn ? '#28a745' : '#6c757d'
  loginDiv.html(`
    <div style="padding: 10px; background-color: #f8f9fa; border-radius: 5px;">
      <strong>Login State:</strong><br>
      <span style="color: ${statusColor};">Username: ${currentLoginState.username}</span><br>
      <span>Has Account: ${currentLoginState.hasAccount ? 'Yes' : 'No'}</span><br>
      <span>Status: ${currentLoginState.isLoggedIn ? 'Logged In' : 'Device Only'}</span>
    </div>
  `)
}

const checkAccountGoogleLinkStatus = async () => {
  if (!accountToken) return false
  console.log("checkAccountGoogleLinkStatus called with accountToken:", accountToken)

  try {
    const result = await genGame.getLinkedProviders()
    console.log("linked provider result, ", result)
    linkedProviders = (result as any)?.linked_providers || []
    updateLinkedProvidersDisplay()
    return linkedProviders.includes('google')
  } catch (error) {
    console.error('Failed to check OAuth links:', error)
    return false
  }
}

const updateLinkedProvidersDisplay = () => {
  const providersDiv = $('#linked-providers')
  if (linkedProviders.length === 0) {
    providersDiv.html('<strong>Linked Providers:</strong> None')
  } else {
    providersDiv.html(`<strong>Linked Providers:</strong> ${linkedProviders.join(', ')}`)
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
  const unlinkButton = $('#unlink-google')

  if (!accountToken) {
    if (deviceToken) {
      linkButton.prop('disabled', true).text('Link Google (Create Account First)')
      unlinkButton.prop('disabled', true).text('Unlink Google (No Account)')
    } else {
      linkButton.prop('disabled', true).text('Link Google (No Token)')
      unlinkButton.prop('disabled', true).text('Unlink Google (No Token)')
    }
    return
  }

  // Check if Google is already linked
  const isGoogleLinked = await checkAccountGoogleLinkStatus()

  if (isGoogleLinked) {
    linkButton.prop('disabled', true).text('Link Google (Already Linked)')
    unlinkButton.prop('disabled', false).text('Unlink Google')
  } else {
    linkButton.prop('disabled', false).text('Link Google')
    unlinkButton.prop('disabled', true).text('Unlink Google (Not Linked)')
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
$(async () => {
  $('body').append(`
    <div style="margin: 20px; padding: 20px; border: 1px solid #ccc;">
      <h3>Account Management</h3>
      <div id="login-state" style="margin-bottom: 15px;"></div>
      
      <div style="margin-bottom: 10px;">
        <label>Username: <input type="text" id="username-input" placeholder="Enter username" value="${DEFAULT_USERNAME}" /></label>
      </div>
      
      <div style="margin-bottom: 15px;">
        <button id="create-account">Create New Account</button>
      </div>

      <div style="margin-bottom: 10px;">
        <h4>Sign In to Existing Account</h4>
        <label>Username: <input type="text" id="signin-username" placeholder="Username" value="${DEFAULT_USERNAME}" /></label>
      </div>
      
      <div style="margin-bottom: 15px;">
        <button id="signin-account">Sign In to Account</button>
      </div>
      
      <h4>OAuth Management</h4>
      <button id="link-google">Link Google</button>
      <button id="unlink-google">Unlink Google</button>
      <button id="auth-google">Login with Google</button>
      <button id="refresh-providers">Refresh Providers</button>
      
      <div id="oauth-status" style="margin-top: 15px;"></div>
      <div id="linked-providers" style="margin-top: 10px; padding: 10px; background-color: #f5f5f5;"></div>
    </div>
  `)

  // Initialize login state and button states
  updateLoginState('kopi', false, false) // Initial device state
  await updateButtonStates()
  updateLinkedProvidersDisplay()

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
      const { token } = (await Connection.send(channel, 'create_session', { username: username })) as any
      accountToken = token
      currentAccount = account

      // Refresh connection with new token
      await Connection.refreshToken(genGame.state.connection, 'gen_game', token)
      console.log('Refreshed connection with new account token:', accountToken)

      // Update login state
      updateLoginState(username, true, true)

      // Update UI to show we have an account token
      $('#oauth-status').append('<p>Account token created and logged in successfully!</p>')
      await updateButtonStates()

    } catch (error:any) {
      console.error('Create account error:', error)
      $('#oauth-status').html('<p>Error: ' + error.msg + '</p>')
    }
  })

  $('#signin-account').on('click', async () => {
    const username = $('#signin-username').val()?.toString().trim()

    if (!username) {
      updateLoginDisplay()
      return
    }

    try {
      updateLoginDisplay()
      
      // For now, use the create_session method since we don't have a separate auth endpoint
      // TODO: Replace with proper authentication endpoint when available
      console.log('Signing in to existing account:', username)
      const { channel } = await Connection.joinChannel(genGame.state.connection, 'public')
      const { token } = (await Connection.send(channel, 'create_session', { username: username })) as any
      accountToken = token

      // We'll treat this as an existing account for now
      currentAccount = { username: username, display_name: username }

      // Refresh connection with new token
      await Connection.refreshToken(genGame.state.connection, 'gen_game', token)
      console.log('Signed in with token:', accountToken)

      // Update login state (assuming account exists if token created successfully)
      updateLoginState(username, true, false) // false for isFromGoogle since this is regular signin

      updateLoginDisplay()
      $('#signin-username').val('')
      
      await updateButtonStates()

    } catch (error:any) {
      console.error('Sign in error:', error)
      updateLoginDisplay()
      // Keep current state on error
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
    } catch (error: any) {
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
        accountToken = result.token
        currentAccount = result.account

        // Refresh connection with new token
        await Connection.refreshToken(genGame.state.connection, 'gen_game', result.token)
        console.log('Refreshed connection with new Google auth token')

        // Update login state with account info
        updateLoginState(result.account.username, true, true)

        $('#oauth-status').html('<p>Google auth successful! Token: ' + result.token.substring(0, 20) + '...</p>')
        $('#oauth-status').append('<p>Account: ' + JSON.stringify(result.account) + '</p>')

        await updateButtonStates()
      } else {
        console.log('Authentication failed or missing data:', result)
        $('#oauth-status').html('<p>Google auth failed: ' + ((result && result.msg) || 'Unknown error') + '</p>')
      }
    } catch (error: any) {
      console.error('Google auth error:', error)
      $('#oauth-status').html('<p>Auth error: ' + error.message + '</p>')
    }
  })

  $('#unlink-google').on('click', async () => {
    if (!accountToken) {
      $('#oauth-status').html('<p>Error: No account token available. Please login first.</p>')
      return
    }

    if (!confirm('Are you sure you want to unlink your Google account?')) {
      return
    }

    try {
      console.log('Unlinking Google with account token:', accountToken)

      // Use genGame.unlinkGoogle method
      const result = await genGame.unlinkGoogle()

      console.log('Unlink result:', result)
      $('#oauth-status').html('<p>Google unlinked successfully!</p>')
      $('#oauth-status').append('<p>Result: ' + JSON.stringify(result) + '</p>')

      // Refresh button states and provider list
      await updateButtonStates()
    } catch (error: any) {
      console.error('Unlink error:', error)
      $('#oauth-status').html('<p>Unlink error: ' + error.message + '</p>')
    }
  })

  $('#refresh-providers').on('click', async () => {
    if (!accountToken) {
      $('#oauth-status').html('<p>Error: No account token available. Please login first.</p>')
      return
    }

    try {
      await checkAccountGoogleLinkStatus()
      await updateButtonStates()
      $('#oauth-status').html('<p>Provider list refreshed!</p>')
    } catch (error: any) {
      console.error('Refresh error:', error)
      $('#oauth-status').html('<p>Refresh error: ' + error.message + '</p>')
    }
  })
})
