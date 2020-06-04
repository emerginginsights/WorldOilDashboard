const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const config = require('./site-config');

// Define common loader constants
const sourceMap = config.env !== 'production';

// HTML loaders
const html = {
  test: /\.(html)$/,
  use: [
    {
      loader: 'html-loader',
      options: {
        interpolate: true
      }
    }
  ]
};

// Javascript loaders
const js = {
  test: /\.js(x)?$/,
  exclude: /node_modules/,
  use: [
    {
      loader: 'babel-loader',
      options: {
        presets: ['@babel/preset-env']
      }
    },
    'eslint-loader'
  ]
};

// Style loaders
const styleLoader = {
  loader: 'style-loader'
};

const cssLoader = {
  loader: 'css-loader',
  options: {
    sourceMap
  }
};

const postcssLoader = {
  loader: 'postcss-loader',
  options: {
    plugins: [
      require('autoprefixer')()
    ],
    sourceMap
  }
};

const css = {
  test: /\.css$/,
  use: [
    config.env === 'production' ? MiniCssExtractPlugin.loader : styleLoader,
    cssLoader,
    postcssLoader
  ]
};

const sass = {
  test: /\.s[c|a]ss$/,
  use: [
    config.env === 'production' ? MiniCssExtractPlugin.loader : styleLoader,
    cssLoader,
    postcssLoader,
    {
      loader: 'sass-loader',
      options: {
        sourceMap
      }
    }
  ]
};

// Font loaders
const fonts = {
  test: /\.(woff|woff2|eot|ttf|otf|svg)$/,
  exclude: /images/,
  use: [
    {
      loader: 'file-loader',
      query: {
        name: '[name].[hash].[ext]',
        outputPath: 'fonts/'
      }
    }
  ]
};

const handlebars = {
  test: /\.hbs$/,
  loader: 'handlebars-loader'
};

const fileLoader = {
  test: /\.(txt|png)$/i,
  loader: 'file-loader',
  options: {
    name: '[path][name].[ext]'
  }
};

module.exports = [
  html,
  js,
  css,
  sass,
  fonts,
  handlebars,
  fileLoader
];
