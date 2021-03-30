module.exports = {
  plugins: {
    'postcss-import': {},
    'postcss-preset-env': {
      // If you don't set this, you get the GB preset default,
      // which is fine in most cases
      browsers: process.env.BROWSER_SUPPORT,
      // Setting to stage 1 for now so we don't break functionality
      // that worked with postcss-cssnext
      stage: 1,
    },
  },
};
