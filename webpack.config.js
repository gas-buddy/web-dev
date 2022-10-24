const { HotModuleReplacementPlugin } = require('webpack');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const LoadablePlugin = require('@loadable/webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

module.exports = {
  entry: [
    './src/client',
    path.resolve(__dirname, './src/publicPath'),
    isDevelopment && 'webpack-hot-middleware/client',
  ].filter(Boolean),
  mode: isProduction ? 'production' : 'development',
  output: {
    path: path.resolve('./build-static'),
    filename: isProduction ? '[name].[contenthash].js' : '[name].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              envName: 'webpack',
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: {
                localIdentName: isProduction ? '[hash:base64:5]' : '[name]__[local]___[hash:base64:5]',
              },
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  'postcss-import',
                  [
                    'postcss-preset-env',
                    {
                      // If you don't set this, you get the GB preset default,
                      // which is fine in most cases
                      browsers: process.env.BROWSER_SUPPORT,
                      // Setting to stage 1 for now so we don't break functionality
                      // that worked with postcss-cssnext
                      stage: 1,
                    },
                  ],
                ],
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    process.env.WEBPACK_VISUALIZE && new BundleAnalyzerPlugin(),
    isDevelopment && new HotModuleReplacementPlugin(),
    isDevelopment && new ReactRefreshWebpackPlugin(),
    new LoadablePlugin({
      writeToDisk: true,
    }),
    new MiniCssExtractPlugin({
      filename: isProduction ? '[name].[contenthash].css' : '[name].css',
    }),
  ].filter(Boolean),
  resolve: {
    extensions: ['.js', '.json', '.wasm', '.jsx', '.ts', '.tsx'],
  },
};
