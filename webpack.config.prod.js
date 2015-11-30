var path = require('path');
var webpack = require('webpack');

var node_modules_dir = path.resolve(__dirname, 'node_modules');
var d3Path = path.resolve(node_modules_dir, 'd3/d3.min.js');
var reactPath = path.resolve(node_modules_dir, 'react/dist/react.min.js');
var reactDomPath = path.resolve(node_modules_dir, 'react-dom/dist/react-dom.min.js');
var lzStringPath = path.resolve(node_modules_dir, 'lz-string/libs/lz-string.min.js');

module.exports = {
    entry: {
    app: path.resolve(__dirname, 'src/app/index'),
    lib: ['d3', 'react', 'react-dom', 'classnames', 'fbemitter', 'lz-string']
  },
  resolve: {
    // When requiring, you don't need to add these extensions
    extensions: ['', '.js', '.jsx', '.json', '.less'],
    alias: {
      'd3': d3Path,
      'react': reactPath,
      'react-dom': reactDomPath,
      'lz-string': lzStringPath
    },
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'app.js'
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin('lib', 'lib.js'),
    new HtmlWebpackPlugin({
        inject: true,
        template: path.join(__dirname, "src/public/index.html"),
        favicon: path.join(__dirname, "src/assets/images/favicon.png"),
        minify: {
          removeComments: true,
          collapseWhitespace: true,
          minifyJS: true
        }
    })
  ],
  module: {
    noParse: [d3Path, reactPath, reactDomPath, lzStringPath],
    loaders: [
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      { test: /\.(js|jsx)$/, loader: 'babel', include: path.join(__dirname, 'src') },
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
