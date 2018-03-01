/**
 * Putting this in the default exports seems to blow up webpack 4.0.1. So we just make it a
 * one-off with @gasbuddy/web-dev/hot
 */
if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line global-require
  const { hot } = require('react-hot-loader');
  module.exports.hot = hot;
}
