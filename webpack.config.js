const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const sharp = require('sharp');

// SVGをPNGに変換する関数
async function convertSvgToPng(input, size) {
  return await sharp(input)
    .resize(size, size)
    .png()
    .toBuffer();
}

module.exports = {
  mode: 'production',
  entry: {
    background: './src/background.ts',
    content: './src/content.ts',
    popup: './src/popup/popup.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@utils': path.resolve(__dirname, 'src/utils/'),
    },
  },
  plugins: [
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