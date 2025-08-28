import Connection from "../../../src/connection"
import GenGame from "../../../src/gen_game"
import {
  renderLoginState,
  updateLinkedProvidersDisplay,
  setButtonStates,
  getUsernameInput,
  getSigninUsername,
  showStatus,
  LoginState
} from './account/ui'


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
  let currentLoginState: LoginState = {
    username: DEFAULT_USERNAME,
    hasAccount: false,
    isLoggedIn: false
  }

  const updateLoginState = (username: string, hasAccount: boolean, isLoggedIn: boolean) => {
    currentLoginState = { username, hasAccount, isLoggedIn }
    renderLoginState(currentLoginState)
  }

  const checkAccountGoogleLinkStatus = async () => {
    if (!accountToken) return false
    try {
      const result = await genGame.getLinkedProviders()
      linkedProviders = (result as any)?.linked_providers || []
      updateLinkedProvidersDisplay(linkedProviders)
      return linkedProviders.includes('google')
    } catch (error) {
      console.error('Failed to check OAuth links:', error)
      return false
    }
  }

  const updateButtonStates = async () => {
    const isGoogleLinked = await checkAccountGoogleLinkStatus()
    setButtonStates({ accountToken, deviceToken, isGoogleLinked })
  }

  $(async () => {
    deviceToken = await genGame.authenticateDevice('kopi')
    updateLoginState('kopi', false, false) // Initial device state
    await updateButtonStates()
    updateLinkedProvidersDisplay(linkedProviders)

    $('#create-account').on('click', async () => {
      try {
        const username = getUsernameInput()
        if (!username) {
          showStatus('Error: Please enter a username')
          return
        }

        const account = await genGame.createAccount({
          username: username,
          display_name: username
        })
        showStatus('Account created: ' + JSON.stringify(account))

        // Create session token for the new account
        const { channel } = await Connection.joinChannel(genGame.state.connection, 'public')
        const { token } = (await Connection.send(channel, 'create_session', { username: username })) as any
        accountToken = token

        // Refresh connection with new token
        await Connection.refreshToken(genGame.state.connection, 'gen_game', token)

        updateLoginState(username, true, true)

        showStatus('Account token created and logged in successfully!', true)
        await updateButtonStates()

      } catch (error: any) {
        console.error('Create account error:', error)
        showStatus('Error: ' + (error.msg || error.message || JSON.stringify(error)))
      }
    })

    $('#signin-account').on('click', async () => {
      const username = getSigninUsername()

      if (!username) {
        return
      }

      try {
        const { channel } = await Connection.joinChannel(genGame.state.connection, 'public')
        const { token } = (await Connection.send(channel, 'create_session', { username: username })) as any
        accountToken = token

        // Refresh connection with new token
        await Connection.refreshToken(genGame.state.connection, 'gen_game', token)

        updateLoginState(username, true, false)

        await updateButtonStates()

      } catch (error: any) {
        console.error('Sign in error:', error)
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
        showStatus('Google linked successfully!')
        showStatus('Result: ' + JSON.stringify(result), true)
        await updateButtonStates()
      } catch (error: any) {
        console.error('Link error:', error)
        showStatus('Link error: ' + (error.message || JSON.stringify(error)))
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

          showStatus('Google auth successful! Token: ' + result.token.substring(0, 20) + '...', false)
          showStatus('Account: ' + JSON.stringify(result.account), true)

          await updateButtonStates()
        } else {
          showStatus('Google auth failed: ' + ((result && result.msg) || 'Unknown error'))
        }
      } catch (error: any) {
        console.error('Google auth error:', error)
        showStatus('Auth error: ' + (error.message || JSON.stringify(error)))
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
        showStatus('Google unlinked successfully!')
        showStatus('Result: ' + JSON.stringify(result), true)
        await updateButtonStates()
      } catch (error: any) {
        console.error('Unlink error:', error)
        showStatus('Unlink error: ' + (error.message || JSON.stringify(error)))
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
        showStatus('Provider list refreshed!')
      } catch (error: any) {
        console.error('Refresh error:', error)
        showStatus('Refresh error: ' + (error.message || JSON.stringify(error)))
      }
    })
  })
}
