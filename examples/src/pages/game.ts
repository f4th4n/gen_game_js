import GenGame from "../../../src/gen_game"

// Main bootstrap for examples/dev.html: create a single GenGame instance and hand off to page modules.
const DEFAULT_HOST = 'localhost'
const DEFAULT_PORT = 4000

async function main() {
  const genGame = new GenGame(DEFAULT_HOST, DEFAULT_PORT)

  await genGame.connect()

  // Authenticate device for development flow (keeps existing behavior)
  const deviceToken = await genGame.authenticateDevice('kopi')
  console.log('Device token:', deviceToken)

  // Initialize pages, passing the shared genGame instance.
  initGamePage(genGame)
}

main().catch(err => console.error('Game page init error:', err))

function initGamePage(genGame: GenGame) {
  const listenGameChangeState = () => {
    genGame.onChangeState((payload: any) => {
      $('#messages').append(`<p>${payload.move_x}</p>`)
    })
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
}
