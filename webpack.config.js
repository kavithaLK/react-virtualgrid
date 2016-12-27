var path = require('path');
var webpack = require('webpack');

module.exports = {
  devtool: 'eval',
   entry: [
    'webpack-dev-server/client?http://localhost:3000',
    'webpack/hot/only-dev-server',
    './src/index-example.js',
    './src/index.js'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/static/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
  module: {
    loaders: [
           {
	    test: /\.(js|jsx)$/,
            loader: 'babel',
            exclude: /node_modules/,
            query: {
                presets: ['es2015', 'react']
            }
        },
        {
          test: /\.sass$/,
          loaders: [ 'style', 'css', 'sass' ]

        },
    {
                test: /\.css$/,
                loader:'style!css!'
    }
    ]
  },
};
