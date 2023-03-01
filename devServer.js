var webpack = require('webpack');
var WebpackDevServer = require("webpack-dev-server");
var config = require('./webpack.config.dev');

new WebpackDevServer(webpack(config), {
  hot: true,
  headers: { "Access-Control-Allow-Origin": "*" },
  historyApiFallback: {
    rewrites: [
      // For some reason connect-history-api-fallback does not allow '.' in the URL for history fallback...
      { from: /\/outfit\//, to: '/index.html' }
    ]
  }
}).listen(3300, "0.0.0.0", function (err, result) {
  if (err) {
    console.log(err);
  }

  console.log("Listening at localhost:3300");
});
