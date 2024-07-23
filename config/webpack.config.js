const path = require('path')

module.exports = {
  mode: 'development',
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  context: `${__dirname}/../src/`,
  entry: {
    gen_game: './gen_game.ts',
  },
  devtool: 'source-map',
  output: {
    path: `${__dirname}/../build/`,
    globalObject: 'this',
    sourceMapFilename: '[file].map',
    devtoolModuleFilenameTemplate: 'webpack:///[resource-path]', // string
    devtoolFallbackModuleFilenameTemplate: 'webpack:///[resource-path]?[hash]', // string
    filename: '[name].js',
    library: {
      name: 'GenGame',
      type: 'umd',
      umdNamedDefine: true,
    },
  },
  performance: { hints: false },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    liveReload: true,
    port: 9000,
    open: ['/example.html'],
    hot: true,
  },
}
