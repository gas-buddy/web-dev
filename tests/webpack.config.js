const path = require('path');
const webpackConfig = require('../src').webpackConfig;

if (!process.env.BROWSER_SUPPORT) {
  process.env.BROWSER_SUPPORT = 'last 2 Android versions,iOS >= 10';
}

// eslint-disable-next-line import/no-extraneous-dependencies
module.exports = (env) => {
  const config = webpackConfig(env);

  config.entry.client = path.resolve(__dirname, './entrypoint.js');
  config.module.rules.forEach((rule) => {
    if (rule.use && rule.use.length && rule.use[0].loader === 'babel-loader') {
      rule.exclude = /node_modules\/(?!(@gasbuddy\/react-components)\/).*/;
    }
  });
  return config;
};
