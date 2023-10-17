import path from 'path';
import webpack from 'webpack';
// eslint-disable-next-line import/no-extraneous-dependencies
import ManifestPlugin from 'webpack-manifest-plugin';
import LoadablePlugin from '@loadable/webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

export function webpackConfig(optionsOrNull: {
  production: Boolean,
  output?: webpack.Output,
  miniCss?: Object,
}) {
  const options = optionsOrNull || {};
  const isProd = process.env.NODE_ENV === 'production' || options.production;

  // These paths are relative to CWD, which is expected to be package root
  const config: webpack.Configuration = {
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
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
  };

  const plugins = [
    new ManifestPlugin(),
    new LoadablePlugin({ writeToDisk: true }),
  ];

  if (process.env.WEBPACK_VISUALIZE) {
    plugins.unshift(new BundleAnalyzerPlugin());
  }

  const rules = [
    {
      test: /\.jsx?$/,
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
      test: /\.tsx?$/,
      exclude: /node_modules/,
      use: [
        {
          loader: 'ts-loader',
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
          options: {
            sourceMap: true,
            modules: {
              localIdentName: '[name]__[local]___[hash:base64:5]',
            },
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
              require('postcss-preset-env')({
                // If you don't set this, you get the GB preset default,
                // which is fine in most cases
                browsers: process.env.BROWSER_SUPPORT,
                // Setting to stage 1 for now so we don't break functionality
                // that worked with postcss-cssnext
                stage: 1,
              }),
            ],
          },
        },
      ],
    },
  ];

  if (!(isProd)) {
    // @ts-ignore
    config!.entry!.client = [].concat(config!.entry?.client);
    // @ts-ignore
    config!.entry?.client?.unshift('webpack-hot-middleware/client?reload=true');

    plugins.push(
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NamedModulesPlugin(),
      new webpack.NoEmitOnErrorsPlugin(),
    );
  }

  if (isProd) {
    config!.optimization!.minimizer = [
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
