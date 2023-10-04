const path = require('path');
const { webpackConfig } = require('../src');

if (!process.env.BROWSER_SUPPORT) {
  process.env.BROWSER_SUPPORT = 'last 2 Android versions,iOS >= 10';
}

// eslint-disable-next-line import/no-extraneous-dependencies
export default function configure(env: { production: Boolean }) {
  const config = webpackConfig(env);

  config.entry.client = path.resolve(__dirname, './entrypoint.js');
  return config;
}
