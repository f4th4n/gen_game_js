// !!!!!! WARNING !!!!!!
// this file is used only for development purpose

import { GenGame } from './gen_game'

// const genGame = new GenGame('localhost', 4000)
// //genGame.authenticateDeviceAsync('testestest')
// genGame.createMatch()

const genGame = new GenGame('localhost', 4000, 'http')

await genGame.connect()

const token = await genGame.authenticateDevice('kopi')

console.log('my token is', token)

const match = await genGame.createMatch()
console.log('match', match)

// console.log('matchmatchmatch', match)

// const client = GenGame.createClient('localhost', 4000)

// // create user and authenticate it
// await client.authenticateDeviceAsync('dev-123')

// // create match and return GenGame.Game object
// const game = await client.createMatch()

// // add callback onRelay, called when there is on-relay event
// game.onRelay += (payload) => {
//   console.log('payload', payload)
// }

// // dispatch event relay to all player in the same match with some payload
// await game.relay({ move_x: 110 })
