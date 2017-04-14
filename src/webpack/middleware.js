import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

const WebpackMiddlewareCloseHandle = Symbol('Webpack dev middleware close function');

export function webpackMiddleware(opts) {
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
  const hotMiddleware = webpackHotMiddleware(compiler, {
    dynamicPublicPath: true,
  });

  const webpackMiddlewareFn = (req, res, next) => (
    devMiddleware(req, res, () => hotMiddleware(req, res, next))
  );
  webpackMiddlewareFn[WebpackMiddlewareCloseHandle] = () => devMiddleware.close();
  return webpackMiddlewareFn;
}

export function shutdownWebpackWatcher(app) {
  // Webpack dev middleware watches the filesystem and as such seems to need to
  // be explicitly shut down.
  // eslint-disable-next-line no-underscore-dangle
  const wpmw = app._router.stack.find(m =>
    m.handle && Object.hasOwnProperty.call(m.handle, WebpackMiddlewareCloseHandle));
  if (wpmw) {
    const fn = wpmw.handle[WebpackMiddlewareCloseHandle];
    if (fn && typeof fn === 'function') {
      fn();
    }
  }
}
