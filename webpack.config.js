const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const sharp = require('sharp');
const webpack = require('webpack');
const VersionIncrementerPlugin = require('./webpack-plugins/version-incrementer');
const packageJson = require('./package.json');

// SVGをPNGに変換する関数
async function convertSvgToPng(input, size) {
  return await sharp(input)
    .resize(size, size)
    .png()
    .toBuffer();
}

const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = {
  mode: isDevelopment ? 'development' : 'production',
  devtool: isDevelopment ? 'inline-source-map' : false,
  entry: {
    background: './src/background.js',
    content: './src/content.js',
    popup: './src/popup/popup.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true,
  },
  resolve: {
    extensions: ['.js'],
    alias: {
      '@utils': path.resolve(__dirname, 'src/utils/'),
    },
  },
  plugins: [
    new VersionIncrementerPlugin(),
    new webpack.DefinePlugin({
      'process.env.APP_VERSION': JSON.stringify(packageJson.version)
    }),
    new HtmlWebpackPlugin({
      template: './src/popup/popup.html',
      filename: 'popup/popup.html',
      chunks: ['popup'],
    }),
    new CopyPlugin({
      patterns: [
        {
          from: './src/popup/popup.css',
          to: 'popup/popup.css',
        },
        {
          from: './src/icons/icon.svg',
          to: 'icons/icon16.png',
          transform: async (content) => await convertSvgToPng(content, 16),
        },
        {
          from: './src/icons/icon.svg',
          to: 'icons/icon48.png',
          transform: async (content) => await convertSvgToPng(content, 48),
        },
        {
          from: './src/icons/icon.svg',
          to: 'icons/icon128.png',
          transform: async (content) => await convertSvgToPng(content, 128),
        },
      ],
    }),
  ],
};