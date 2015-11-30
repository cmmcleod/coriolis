var path = require('path');
var webpack = require('webpack');

module.exports = {
  devtool: 'eval',
  entry: {
    app: [ 'webpack-hot-middleware/client', './src/app/index' ],
    lib: ['d3', 'react', 'react-dom', 'classnames', 'fbemitter', 'lz-string']
  },
  resolve: {
    // When requiring, you don't need to add these extensions
    extensions: ['', '.js', '.jsx', '.json', '.less'],
    alias: {
      'coriolis-data': path.resolve(__dirname, 'node_modules/coriolis-data')
    },
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'app.js',
    publicPath: '/'
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin('lib', 'lib.js'),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ],
  module: {
    loaders: [
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      { test: /\.(js|jsx)$/, loaders: [ 'babel' ], include: path.join(__dirname, 'src') },
      { test: /\.less$/, loader: 'style!css!less' },
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/font-woff' },
      { test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/font-woff' },
      { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/octet-stream' },
      { test: /\.(png|jpg|jpeg|gif)?$/, loader: 'file' },
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file' },
      { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=image/svg+xml' }
    ]
  }
};
