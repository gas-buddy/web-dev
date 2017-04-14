import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

export const WebpackMiddlewareCloseHandle = Symbol('Webpack dev middleware close function');

export default function webpackMiddlewareThunk(opts) {
  const {
    config,
    path: publicPath = '/',
    env = process.env.NODE_ENV,
  } = opts;

  let wpconfig;
  let compiler;

  try {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    wpconfig = config(env);
    compiler = webpack(wpconfig);
  } catch (e) {
    e.message = `Webpack config malformed: ${e.message}`;
    throw e;
  }

  const devMiddleware = webpackDevMiddleware(compiler, {
    publicPath,
    stats: { colors: true },
  });
  const hotMiddleware = webpackHotMiddleware(compiler);

  const webpackMiddlewareFn = (req, res, next) => (
    devMiddleware(req, res, () => hotMiddleware(req, res, next))
  );
  webpackMiddlewareFn[WebpackMiddlewareCloseHandle] = () => devMiddleware.close();
  return webpackMiddlewareFn;
}
