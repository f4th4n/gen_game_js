// !!!!!! WARNING !!!!!!
// this file is used only for development purpose

import { GenGame } from './gen_game'

const genGame = new GenGame('localhost', 4000)

await genGame.connect()
await genGame.authenticateDevice('kopi')
await genGame.createMatch()

genGame.onChangeState((payload: object) => {
  console.log('there is update state with payload:', payload)
})

await genGame.setState({ move_x: 110 })
