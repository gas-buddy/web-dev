import path from 'path';
import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import Visualizer from 'webpack-visualizer-plugin';
import getLocalIdent from 'css-loader/lib/getLocalIdent';

const CSS_BUNDLE = 'bundle.css';
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
      filename: '[name].bundle.js',
      publicPath: '/',
      path: path.resolve('./build-static'),
    },
  };

  const plugins = [
    new webpack.EnvironmentPlugin({
      NODE_ENV: isProd ? 'production' : 'development',
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: Infinity,
      filename: 'vendor.bundle.js',
    }),
  ];

  if (process.env.WEBPACK_VISUALIZE) {
    plugins.unshift(new Visualizer());
  }

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
          options: {
            localIdentName: '[name]__[local]___[hash:base64:5]',
            getLocalIdent(loaderContext, localIdentName, localName, options) {
              const { resourcePath } = loaderContext;
              const moduleRegEx = /\/node_modules\/(@[\w-]+\/)?([\w-]+)/g;
              // If CSS is being loaded from the node_modules directory, we attempt to set the
              // context to the root of that module. This ensures that class name hashes remain
              // consistent.
              if (moduleRegEx.test(resourcePath)) {
                const modulePaths = resourcePath.match(moduleRegEx).join('');
                const basePath = resourcePath.split(modulePaths)[0] + modulePaths;
                options.context = basePath;
              }
              return getLocalIdent(loaderContext, localIdentName, localName, options);
            },
            sourceMap: true,
            modules: true,
            importLoaders: 1,
          },
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
      new ExtractTextPlugin(CSS_BUNDLE),
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
