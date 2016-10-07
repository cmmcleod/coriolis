var path = require('path');
var exec = require('child_process').exec;
var webpack = require('webpack');
var pkgJson = require('./package');
var HtmlWebpackPlugin = require("html-webpack-plugin");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var AppCachePlugin = require('appcache-webpack-plugin');

var node_modules_dir = path.resolve(__dirname, 'node_modules');
var d3Path = path.resolve(node_modules_dir, 'd3/d3.min.js');
var reactPath = path.resolve(node_modules_dir, 'react/dist/react.min.js');
var reactDomPath = path.resolve(node_modules_dir, 'react-dom/dist/react-dom.min.js');
var lzStringPath = path.resolve(node_modules_dir, 'lz-string/libs/lz-string.min.js');

function CopyDirPlugin(source, destination) {
    this.source = source;
    this.destination = destination;
}
CopyDirPlugin.prototype.apply = function(compiler) {
    compiler.plugin('done', function() {
      console.log(compiler.outputPath, this.destination);
      exec('cp -r ' + this.source + ' ' + path.join(compiler.outputPath, this.destination));
    }.bind(this));
};

module.exports = {
  entry: {
    app: ['babel-polyfill', path.resolve(__dirname, 'src/app/index')],
    lib: ['babel-polyfill', 'd3', 'react', 'react-dom', 'classnames', 'fbemitter', 'lz-string']
  },
  resolve: {
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
    filename: '[name].[chunkhash:6].js',
    chunkFilename: '[name].[chunkhash:6]',
    publicPath: '/'
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      mangle: {
        except: []
      },
      'screw-ie8': true
    }),
    new webpack.optimize.CommonsChunkPlugin('lib', 'lib.[chunkhash:6].js'),
    new HtmlWebpackPlugin({
        inject: false,
        appCache: 'coriolis.appcache',
        minify: {
          collapseBooleanAttributes: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true,
          removeComments: true,
          removeEmptyAttributes: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true
        },
        template: path.join(__dirname, "src/index.html"),
        uaTracking: process.env.CORIOLIS_UA_TRACKING || '',
        gapiKey: process.env.CORIOLIS_GAPI_KEY || '',
        version: pkgJson.version
    }),
    new ExtractTextPlugin('[contenthash:6].css', {
        allChunks: true
    }),
    new CopyDirPlugin(path.join(__dirname, 'src/schemas'), 'schemas'),
    new CopyDirPlugin(path.join(__dirname, 'src/images/logo/*'), ''),
    new CopyDirPlugin(path.join(__dirname, 'src/migrate.html'), ''),
    new CopyDirPlugin(path.join(__dirname, 'src/.htaccess'), ''),
    new AppCachePlugin({
      network: ['*'],
      settings: ['prefer-online'],
      exclude: ['index.html', /.*\.map$/],
      output: 'coriolis.appcache'
    })
  ],
  module: {
    noParse: [d3Path, reactPath, lzStringPath],
    loaders: [
      // Expose non-parsed globally scoped libs
      { test: reactPath, loader: "expose?React" },
      { test: d3Path, loader: "expose?d3" },
      { test: lzStringPath, loader: "expose?LZString" },

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
