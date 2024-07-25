import Client from './client'

class GenGame {
  static version = '1.0.1'

  static hello(): boolean {
    console.log('hello')
    return false
  }
}

// --------------------------------------------------------------------------------- expose

const glob: any = global
glob.Client = Client
glob.GenGame = GenGame

export { Client, GenGame }
export default GenGame
