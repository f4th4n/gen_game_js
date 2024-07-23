const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
  mode: 'production',
  name: 'gen-game-umd',
  context: `${__dirname}/../src/`,
  entry: {
    gen_game: './gen_game.ts',
    'gen_game.min': './gen_game.ts',
  },
  output: {
    path: `${__dirname}/../dist/`,
    filename: '[name].js',
    globalObject: 'this',
    library: {
      name: 'GenGame',
      type: 'umd',
      umdNamedDefine: true,
    },
  },
  performance: { hints: false },
  optimization: {
    minimizer: [
      new TerserPlugin({
        include: /\.min\.js$/,
        parallel: true,
        extractComments: false,
        terserOptions: {
          format: {
            comments: false,
          },
          compress: true,
          ie8: false,
          ecma: 5,
          warnings: false,
        },
      }),
    ],
  },
  plugins: [new CleanWebpackPlugin()],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
}
