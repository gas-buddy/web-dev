import devMiddleware from 'webpack-dev-middleware';
import hotMiddleware from 'webpack-hot-middleware';
import webpack from 'webpack';

export default function webpackMiddleware(options) {
  const compiler = webpack(options.config);

  const devOptions = {
    // Write the stats file so the SSR is looking at the latest
    writeToDisk(filePath) {
      return /loadable-stats/.test(filePath);
    },
    ...options.dev,
  };

  return [
    devMiddleware(compiler, devOptions),
    hotMiddleware(compiler, options.hot),
  ];
}
