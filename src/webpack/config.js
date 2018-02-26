import path from 'path';
import webpack from 'webpack';
import ManifestPlugin from 'webpack-manifest-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import Visualizer from 'webpack-visualizer-plugin';
import { generateScopedName } from './styleid';

const POLYFILL_FILE = 'polyfill.js';

export function webpackConfig(env) {
  // I hate this config. Thx webpack.
  const isProd = env.production && env.production !== 'false';

  // These paths are relative to CWD, which is expected to be package root
  const config = {
    devtool: '#inline-source-map',
    entry: {
      client: path.resolve('./src/client'),
      vendor: [path.resolve(__dirname, POLYFILL_FILE), 'react', 'react-dom', 'react-router', 'react-router-dom'],
    },
    output: {
      filename: isProd ? '[name].[chunkhash].js' : '[name].bundle.js',
      publicPath: '/s/',
      path: path.resolve('./build-static/s'),
    },
  };

  const plugins = [
    new webpack.EnvironmentPlugin({
      NODE_ENV: isProd ? 'production' : 'development',
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: Infinity,
    }),
    new ManifestPlugin(),
  ];

  if (process.env.WEBPACK_VISUALIZE) {
    plugins.unshift(new Visualizer());
  }

  const cssLoaderOpts = {
    localIdentName: '[name]__[local]___[hash:base64:5]',
    sourceMap: true,
    modules: true,
    importLoaders: 1,
  };

  const loaders = [
    {
      test: /\.js$/,
      exclude: /node_modules/,
      use: [
        {
          loader: 'babel-loader',
          options: {
            babelrc: false,
            presets: [
              // I don't love that this is hardcoded as opposed to reading from .babelrc
              ['gasbuddy', {
                webpack: true,
                browsers: process.env.BROWSER_SUPPORT,
              }],
            ],
          },
        },
      ],
    },
    {
      test: /\.css$/,
      use: [
        'style-loader',
        {
          loader: 'css-loader',
          options: cssLoaderOpts,
        },
        {
          loader: 'postcss-loader',
          options: {
            plugins: () => [
              // eslint-disable-next-line global-require
              require('postcss-import'),
              // eslint-disable-next-line global-require
              require('postcss-cssnext')({
                // If you don't set this, you get the GB preset default,
                // which is fine in most cases
                browsers: process.env.BROWSER_SUPPORT,
              }),
            ],
          },
        },
      ],
    },
  ];

  if (!(isProd)) {
    const RHL = 'react-hot-loader/';

    config.entry.client = [].concat(config.entry.client);
    if (config.entry.client.indexOf(`${RHL}patch`) === -1) {
      config.entry.client.unshift(
        `${RHL}patch`,
        'webpack-hot-middleware/client?reload=true',
      );
    }

    plugins.push(
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NamedModulesPlugin(),
      new webpack.NoEmitOnErrorsPlugin(),
    );
  }

  if (isProd) {
    // Short names
    delete cssLoaderOpts.localIdentName;
    cssLoaderOpts.getLocalIdent = (context, localIdentName, localName) =>
      generateScopedName(localName, context.resourcePath);

    // fix loaders for prod
    const [, cssLoader] = loaders;
    const { use: [style, ...rest] } = cssLoader;

    const extract = ExtractTextPlugin.extract({
      fallback: style,
      use: rest,
    });

    cssLoader.use = extract;

    // fix plugins for prod
    plugins.push(
      new ExtractTextPlugin(isProd ? '[name].[contenthash].css' : '[name].bundle.css'),
      new webpack.optimize.UglifyJsPlugin({ sourceMap: true }),
      new webpack.LoaderOptionsPlugin({ minimize: true }),
    );

    // other opts
    Object.assign(config, {
      devtool: 'source-map',
      performance: {
        maxAssetSize: 100 * 1000, // get mad at 100kB
        maxEntrypointSize: 300 * 1000, // get mad at 300kB
        hints: 'warning',
      },
    });
  }

  return Object.assign(config, {
    module: { loaders },
    plugins,
  });
}
