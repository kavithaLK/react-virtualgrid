var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  devtool: 'eval',
   entry: {
    'react-virtualgrid' : './src/index-example.js'
  },
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
    loader: ExtractTextPlugin.extract("style", 'css!sass')
        }
    ]
  },
  plugins: [
        new ExtractTextPlugin('virtualgrid-demo.css', {
            allChunks: true
        })
    ]
 };
