import tap from 'tap';
import webpack from 'webpack';
import webpackConfig from './webpack.config';

tap.test('run webpack', async (t) => {
  t.plan(6, 'Should check 6 things');
  await new Promise(async (accept) => {
    webpack(webpackConfig({ production: true }), (error, status) => {
      if (error) {
        t.fail(error);
        return;
      }
      const json = status.toJson();
      t.strictEquals(json.assetsByChunkName.client.length, 3, 'Should generate 3 client files');
      t.strictEquals(json.assetsByChunkName.vendor.length, 2, 'Should generate 2 vendor files');
      const clientJs = json.assets.find(a => /^client\..*\.js$/.test(a.name));
      t.ok(clientJs, 'Should produce client js');
      t.ok(clientJs.size < 75000, `Client bundle should be less than 75k (${clientJs.size})`);
      const vendorJs = json.assets.find(a => /^vendor\..*\.js$/.test(a.name));
      t.ok(vendorJs, 'Should produce vendor js');
      t.ok(vendorJs.size < 175000, `Client bundle should be less than 175k (${vendorJs.size})`);
      accept();
    });
  });
});
