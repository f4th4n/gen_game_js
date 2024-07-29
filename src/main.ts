// !!!!!! WARNING !!!!!!
// this file is used only for development purpose

import { GenGame } from './gen_game'

const genGame = new GenGame('localhost', 4000)

await genGame.connect()
await genGame.authenticateDevice('kopi')

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
