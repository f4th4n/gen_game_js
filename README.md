# GenGame JavaScript

This is JavaScript client library to communicate with GenServer. It can be used for both generic C# project and Unity.

## Installation

```bash
npm install gen_game_js
```

## Getting Started

First, make sure GenGame server is started. See how to start [here](https://github.com/f4th4n/gen_game#getting-started).

Then:

```js
import { GenGame } from './gen_game'

const genGame = new GenGame('localhost', 4000)

await genGame.connect()
await genGame.authenticateDevice('your-device-id')
await genGame.createMatch()

genGame.onChangeState((payload: object) => {
  console.log('there is update state with payload:', payload)
})

await genGame.setState({ move_x: 110 })
```
