const webpack = require('webpack');
const cssnano = require('cssnano');
const path = require('path');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const config = require('./site-config');

// Hot module replacement
const hmr = new webpack.HotModuleReplacementPlugin();

// Optimize CSS assets
const optimizeCss = new OptimizeCssAssetsPlugin({
  assetNameRegExp: /\.css$/g,
  cssProcessor: cssnano,
  cssProcessorPluginOptions: {
    preset: [
      'default',
      {
        discardComments: {
          removeAll: true
        }
      }
    ]
  },
  canPrint: true
});

// Clean webpack
const clean = new CleanWebpackPlugin();

// Extract CSS
const cssExtract = new MiniCssExtractPlugin({
  filename: 'style.[contenthash].css'
});

// HTML generation
const generateHTMLPlugins = () => new HTMLWebpackPlugin({
  template: path.join(config.root, config.paths.src, 'index.hbs'),
  inject: 'head'
});

module.exports = [
  clean,
  cssExtract,
  generateHTMLPlugins(),
  config.env === 'production' && optimizeCss,
  config.env === 'development' && hmr
].filter(Boolean);
