import webpack from 'webpack';
import webpackConfig from './webpack.config';

describe('run webpack', () => {
  it('should check 6 things', async () => {
    await webpack(webpackConfig({ production: true }), (error, status) => {
      if (error) {
        expect(error).toBeInstanceOf(Error);
        return;
      }

      const json = (status as unknown as any).toJson();
      expect(json?.assetsByChunkName?.client.length).toEqual(3);
      expect(json?.assetsByChunkName?.vendor.length).toEqual(2);
      const clientJs = json?.assets?.find((a: { name: string, size: number }) => /^client\..*\.js$/.test(a.name));
      expect(clientJs).toBeDefined();
      expect(clientJs!.size < 75000).toBeTruthy();
      const vendorJs = json?.assets?.find((a: { name: string, size: number }) => /^vendor\..*\.js$/.test(a.name));
      expect(vendorJs).toBeDefined();
      expect(vendorJs!.size < 175000).toBeTruthy();
    });
  });
});
