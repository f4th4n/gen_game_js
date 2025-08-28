export type LoginState = {
    username: string
    hasAccount: boolean
    isLoggedIn: boolean
}

export function renderLoginState(state: LoginState) {
    const loginDiv = $('#login-state')
    const statusColor = state.isLoggedIn ? '#28a745' : '#6c757d'
    loginDiv.html(`
    <div style="padding: 10px; background-color: #f8f9fa; border-radius: 5px;">
      <strong>Login State:</strong><br>
      <span style="color: ${statusColor};">Username: ${state.username}</span><br>
      <span>Has Account: ${state.hasAccount ? 'Yes' : 'No'}</span><br>
      <span>Status: ${state.isLoggedIn ? 'Logged In' : 'Device Only'}</span>
    </div>
  `)
}

export function updateLinkedProvidersDisplay(providers: string[]) {
    const providersDiv = $('#linked-providers')
    if (!providers || providers.length === 0) {
        providersDiv.html('<strong>Linked Providers:</strong> None')
    } else {
        providersDiv.html(`<strong>Linked Providers:</strong> ${providers.join(', ')}`)
    }
}

export function setButtonStates(opts: { accountToken?: string; deviceToken?: string; isGoogleLinked?: boolean }) {
    const linkButton = $('#link-google')
    const unlinkButton = $('#unlink-google')

    if (!opts.accountToken) {
        if (opts.deviceToken) {
            linkButton.prop('disabled', true).text('Link Google (Create Account First)')
            unlinkButton.prop('disabled', true).text('Unlink Google (No Account)')
        } else {
            linkButton.prop('disabled', true).text('Link Google (No Token)')
            unlinkButton.prop('disabled', true).text('Unlink Google (No Token)')
        }
        return
    }

    if (opts.isGoogleLinked) {
      linkButton.prop('disabled', true).text('Link Google (Already Linked)')
      unlinkButton.prop('disabled', false).text('Unlink Google')
    } else {
      linkButton.prop('disabled', false).text('Link Google')
      unlinkButton.prop('disabled', true).text('Unlink Google (Not Linked)')
    }
}

export function getUsernameInput() {
    return ($('#username-input').val() || '').toString().trim()
}

export function getSigninUsername() {
    return ($('#signin-username').val() || '').toString().trim()
}

export function showStatus(message: string, append = false) {
    const el = $('#oauth-status')
    if (append) el.append(`<p>${message}</p>`)
    else el.html(`<p>${message}</p>`)
}
