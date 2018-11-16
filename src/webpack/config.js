import path from 'path';
import webpack from 'webpack';
// eslint-disable-next-line import/no-extraneous-dependencies
import ignore from 'babel-preset-gasbuddy/ignore';
import ManifestPlugin from 'webpack-manifest-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import Visualizer from 'webpack-visualizer-plugin';

export function webpackConfig(env) {
  // I hate this config. Thx webpack.
  const isProd = env.production && env.production !== 'false';

  // These paths are relative to CWD, which is expected to be package root
  const config = {
    mode: isProd ? 'production' : 'development',
    devtool: '#inline-source-map',
    optimization: {
      splitChunks: {
        cacheGroups: {
          vendor: {
            chunks: 'initial',
            test: 'vendor',
            name: 'vendor',
            enforce: true,
          },
        },
      },
    },
    entry: {
      client: path.resolve('./src/client'),
      vendor: ['react', 'react-dom', 'react-router', 'react-router-dom'],
    },
    output: {
      filename: isProd ? '[name].[chunkhash].js' : '[name].bundle.js',
      publicPath: '/s/',
      path: path.resolve('./build-static'),
    },
  };

  const plugins = [
    new webpack.EnvironmentPlugin({
      NODE_ENV: isProd ? 'production' : 'development',
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

  const rules = [
    {
      test: /\.js$/,
      // This is necessary to get the babel-polyfill to be minimized
      exclude: ignore,
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
        isProd ? MiniCssExtractPlugin.loader : 'style-loader',
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
    config.entry.client = [].concat(config.entry.client);
    config.entry.client.unshift('webpack-hot-middleware/client?reload=true');

    plugins.push(
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NamedModulesPlugin(),
      new webpack.NoEmitOnErrorsPlugin(),
    );
  }

  if (isProd) {
    config.optimization.minimizer = [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: true,
      }),
      new OptimizeCSSAssetsPlugin({
        cssProcessorOptions: {
          inline: false,
        },
      }),
    ];

    // fix plugins for prod
    plugins.push(
      new MiniCssExtractPlugin({
        filename: isProd ? '[name].[chunkhash].css' : '[name].bundle.css',
      }),
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
    module: { rules },
    plugins,
  });
}
