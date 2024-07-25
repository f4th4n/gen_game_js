import './style.css'
import { setupCounter } from './counter'
import { GenGame, Client } from 'gen_game_js'

const app = async () => {
  //const GenGame = 'f'

  // console.log('start app...', greet())

  console.log('Client.test()', Client.test())
  console.log('GenGame.hello()', GenGame.hello())

  ////  const client = new GenGame.client('localhost', 4000)
  ////
  ////  // create user and authenticate it
  ////  await client.authenticateDeviceAsync('dev-123')
  ////
  ////  // create match and return GenGame.Game object
  ////  const game = await client.createMatch()
  ////
  ////  // add callback onRelay, called when there is on-relay event
  ////  game.onRelay += (payload) => {
  ////    console.log('payload', payload)
  ////  }
  ////
  ////  // dispatch event relay to all player in the same match with some payload
  ////  await game.relay({ move_x: 110 })
}

app()

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>Example GenGame JS</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite and TypeScript logos to learn more
    </p>
  </div>
`

setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)
