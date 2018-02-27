import tap from 'tap';
import webpack from 'webpack';
import webpackConfig from './webpack.config';

tap.test('run webpack', async (t) => {
  await new Promise(async (accept) => {
    webpack(webpackConfig({ production: true }), (error, status) => {
      if (error) {
        t.fail(error);
        return;
      }
      console.log(status.toString({ chunks: false, colors: true }));
      accept(status);
    });
  });
  t.ok(true);
});
