const HtmlWebPackPlugin = require('html-webpack-plugin')
const path = require('path')

module.exports = {
  entry: {
    app: './index.js'
  },
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'main.js',
    publicPath: '/'
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: path.resolve(__dirname, 'app/index.html'),
      filename: 'index.html'
    })
  ]
}
