var path = require('path');
var webpack = require('webpack');
var pkgJson = require('./package');
var HtmlWebpackPlugin = require("html-webpack-plugin");
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  devtool: 'eval',
  devServer: {
    headers: { "Access-Control-Allow-Origin": "*" }
  },
  entry: {
    app: [ 'webpack-dev-server/client?http://0.0.0.0:3300', 'webpack/hot/only-dev-server', path.join(__dirname, "src/app/index.js") ],
    lib: ['d3', 'react', 'react-dom', 'classnames', 'fbemitter', 'lz-string']
  },
  resolve: {
    // When requiring, you don't need to add these extensions
    extensions: ['', '.js', '.jsx', '.json', '.less']
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'app.js',
    publicPath: '/'
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin('lib', 'lib.js'),
    new HtmlWebpackPlugin({
        inject: false,
        template: path.join(__dirname, "src/index.html"),
        version: pkgJson.version,
        gapiKey: process.env.CORIOLIS_GAPI_KEY || '',
    }),
    new ExtractTextPlugin('app.css', {
        allChunks: true
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ],
  module: {
    loaders: [
      { test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader','css-loader') },
      { test: /\.less$/, loader: ExtractTextPlugin.extract('style-loader','css-loader!less-loader') },
      { test: /\.(js|jsx)$/, loaders: [ 'babel' ], include: path.join(__dirname, 'src') },
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/font-woff' },
      { test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/font-woff' },
      { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/octet-stream' },
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file' },
      { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=image/svg+xml' }
    ]
  }
};
