import path from 'path';
import webpack from 'webpack';
// eslint-disable-next-line import/no-extraneous-dependencies
import ManifestPlugin from 'webpack-manifest-plugin';
import LoadablePlugin from '@loadable/webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

export function webpackConfig(optionsOrNull) {
  const options = optionsOrNull || {};
  const isProd = process.env.NODE_ENV === 'production' || options.production;

  // These paths are relative to CWD, which is expected to be package root
  const config = {
    mode: isProd ? 'production' : 'development',
    devtool: '#inline-source-map',
    optimization: {
      splitChunks: {
        cacheGroups: {
          vendor: {
            chunks: 'initial',
            test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/,
            name: 'vendor',
            enforce: true,
          },
        },
      },
    },
    entry: {
      client: path.resolve('./src/client'),
    },
    output: options.output || {
      filename: isProd ? '[name].[contenthash].js' : '[name].bundle.js',
      publicPath: '/s/',
      path: path.resolve('./build-static'),
    },
  };

  const plugins = [
    new ManifestPlugin(),
    new LoadablePlugin({ writeToDisk: true }),
  ];

  if (process.env.WEBPACK_VISUALIZE) {
    plugins.unshift(new BundleAnalyzerPlugin());
  }

  const cssLoaderOpts = {
    sourceMap: true,
    modules: {
      localIdentName: '[name]__[local]___[hash:base64:5]',
    },
    importLoaders: 1,
  };

  const rules = [
    {
      test: /\.js$/,
      exclude: /node_modules/,
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
        isProd ? MiniCssExtractPlugin.loader : 'style-loader',
        {
          loader: 'css-loader',
          options: cssLoaderOpts,
        },
        {
          loader: 'postcss-loader',
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
      new TerserPlugin({
        cache: true,
        parallel: true,
        sourceMap: true,
      }),
      new OptimizeCSSAssetsPlugin({
        cssProcessorOptions: {
          map: {
            inline: false,
          },
        },
      }),
    ];

    // fix plugins for prod
    plugins.push(
      new MiniCssExtractPlugin({
        filename: isProd ? '[name].[contenthash].css' : '[name].bundle.css',
        ...options.miniCss,
      }),
    );

    // other opts
    Object.assign(config, {
      devtool: 'source-map',
      performance: {
        maxAssetSize: 200 * 1000, // get mad at 200kB
        maxEntrypointSize: 300 * 1000, // get mad at 300kB
        hints: 'warning',
      },
    });
  }
  Object.assign(config, {
    module: { rules },
    plugins,
  });
  return config;
}
