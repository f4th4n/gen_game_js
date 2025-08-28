import Connection from "../../../src/connection"
import GenGame from "../../../src/gen_game"


const DEFAULT_USERNAME = 'kopi'
const DEFAULT_HOST = 'localhost'
const DEFAULT_PORT = 4000

async function main() {
  const genGame = new GenGame(DEFAULT_HOST, DEFAULT_PORT)
  await genGame.connect()
  await genGame.authenticateDevice(DEFAULT_USERNAME)
  initAccountPage(genGame)
}

main().catch(err => console.error('Account page init error:', err))

function initAccountPage(genGame: GenGame) {
  let deviceToken: string | undefined
  let accountToken: string | undefined
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

  const updateLinkedProvidersDisplay = () => {
    const providersDiv = $('#linked-providers')
    if (linkedProviders.length === 0) {
      providersDiv.html('<strong>Linked Providers:</strong> None')
    } else {
      providersDiv.html(`<strong>Linked Providers:</strong> ${linkedProviders.join(', ')}`)
    }
  }

  const checkAccountGoogleLinkStatus = async () => {
    if (!accountToken) return false
    try {
      const result = await genGame.getLinkedProviders()
      linkedProviders = (result as any)?.linked_providers || []
      updateLinkedProvidersDisplay()
      return linkedProviders.includes('google')
    } catch (error) {
      console.error('Failed to check OAuth links:', error)
      return false
    }
  }

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

    const isGoogleLinked = await checkAccountGoogleLinkStatus()

    if (isGoogleLinked) {
      linkButton.prop('disabled', true).text('Link Google (Already Linked)')
      unlinkButton.prop('disabled', false).text('Unlink Google')
    } else {
      linkButton.prop('disabled', false).text('Link Google')
      unlinkButton.prop('disabled', true).text('Unlink Google (Not Linked)')
    }
  }

  // Expect the account UI elements to already exist on the page.
  // Initialize login state and button states once DOM is ready.
  $(async () => {
    deviceToken = await genGame.authenticateDevice('kopi')
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
        const { channel } = await Connection.joinChannel(genGame.state.connection, 'public')
        const { token } = (await Connection.send(channel, 'create_session', { username: username })) as any
        accountToken = token

        // Refresh connection with new token
        await Connection.refreshToken(genGame.state.connection, 'gen_game', token)

        // Update login state
        updateLoginState(username, true, true)

        $('#oauth-status').append('<p>Account token created and logged in successfully!</p>')
        await updateButtonStates()

      } catch (error:any) {
        console.error('Create account error:', error)
        $('#oauth-status').html('<p>Error: ' + (error.msg || error.message || JSON.stringify(error)) + '</p>')
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

        const { channel } = await Connection.joinChannel(genGame.state.connection, 'public')
        const { token } = (await Connection.send(channel, 'create_session', { username: username })) as any
        accountToken = token

        // Refresh connection with new token
        await Connection.refreshToken(genGame.state.connection, 'gen_game', token)

        // Update login state
        updateLoginState(username, true, false)

        updateLoginDisplay()
        $('#signin-username').val('')

        await updateButtonStates()

      } catch (error:any) {
        console.error('Sign in error:', error)
        updateLoginDisplay()
      }
    })

    $('#link-google').on('click', async () => {
      if (!accountToken) {
        $('#oauth-status').html('<p>Error: No account token available. Please create account first.</p>')
        return
      }

      const isAlreadyLinked = await checkAccountGoogleLinkStatus()
      if (isAlreadyLinked) {
        $('#oauth-status').html('<p>Error: Google is already linked to this account.</p>')
        return
      }

      try {
        const result = await genGame.linkGoogle(accountToken)
        $('#oauth-status').html('<p>Google linked successfully!</p>')
        $('#oauth-status').append('<p>Result: ' + JSON.stringify(result) + '</p>')
        await updateButtonStates()
      } catch (error: any) {
        console.error('Link error:', error)
        $('#oauth-status').html('<p>Link error: ' + (error.message || JSON.stringify(error)) + '</p>')
      }
    })

    $('#auth-google').on('click', async () => {
      $('#oauth-status').html('<p>Opening Google authentication popup...</p>')
      try {
        const result = await genGame.authenticateGoogle()
        if (result && result.success && result.token) {
          accountToken = result.token

          await Connection.refreshToken(genGame.state.connection, 'gen_game', result.token)

          updateLoginState(result.account.username, true, true)

          $('#oauth-status').html('<p>Google auth successful! Token: ' + result.token.substring(0, 20) + '...</p>')
          $('#oauth-status').append('<p>Account: ' + JSON.stringify(result.account) + '</p>')

          await updateButtonStates()
        } else {
          $('#oauth-status').html('<p>Google auth failed: ' + ((result && result.msg) || 'Unknown error') + '</p>')
        }
      } catch (error: any) {
        console.error('Google auth error:', error)
        $('#oauth-status').html('<p>Auth error: ' + (error.message || JSON.stringify(error)) + '</p>')
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
        const result = await genGame.unlinkGoogle()
        $('#oauth-status').html('<p>Google unlinked successfully!</p>')
        $('#oauth-status').append('<p>Result: ' + JSON.stringify(result) + '</p>')
        await updateButtonStates()
      } catch (error: any) {
        console.error('Unlink error:', error)
        $('#oauth-status').html('<p>Unlink error: ' + (error.message || JSON.stringify(error)) + '</p>')
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
        $('#oauth-status').html('<p>Refresh error: ' + (error.message || JSON.stringify(error)) + '</p>')
      }
    })
  })
}
