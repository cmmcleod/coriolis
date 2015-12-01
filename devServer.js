var webpack = require('webpack');
var WebpackDevServer = require("webpack-dev-server");
var config = require('./webpack.config.dev');

new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  hot: true,
  historyApiFallback: true
}).listen(3300, "0.0.0.0", function (err, result) {
  if (err) {
    console.log(err);
  }

  console.log("Listening at localhost:3300");
});
