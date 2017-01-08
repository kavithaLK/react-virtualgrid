var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  devtool: 'eval',
   entry : './src/component/VirtualGrid.js',
   output: {
        path: path.join(__dirname, 'dist/umd'),
        filename: 'bundle.js',
        library: 'VirtualGrid',
        libraryTarget: 'umd'
    },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
  resolve:{
      extensions:['', '.js', '.jsx', '.scss', 'sass']
  },
  module: {
    loaders: [
           {
	    test: /\.(js|jsx)$/,
            loader: 'babel',
            exclude: /node_modules/,
            include:__dirname,
            query: {
                presets: ['es2015', 'react']
            }
        },
        {
          test: /\.sass$/,
	  loader: ExtractTextPlugin.extract("style", 'css!sass'),
	  include: path.join(__dirname, 'src')
        }
    ]
  },
  plugins: [
        new ExtractTextPlugin('../../virtualgrid-umd.css', {
            allChunks: true
        })
    ]
};
