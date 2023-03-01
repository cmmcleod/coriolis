const webpack = require('webpack');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const WebpackNotifierPlugin = require('webpack-notifier');

module.exports = merge(common, {
  devtool: 'source-map',
  devServer: {
    headers: { 'Access-Control-Allow-Origin': '*' }
  },
  mode: 'development',
  optimization: {
    minimize: false,
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
      'src/.htaccess', 
      'src/iframe.html', 
      'src/xdLocalStoragePostMessageApi.min.js'
    ]}),
    new WebpackNotifierPlugin({ alwaysNotify: true }),
    new webpack.NoEmitOnErrorsPlugin()
  ]
});
