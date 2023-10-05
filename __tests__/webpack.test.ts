import webpack from 'webpack';
import webpackConfig from './webpack.config';

describe('run webpack', () => {
  it('should produce chunks and assets', async () => {
    await new Promise((accept: Function, reject: Function) => {
      webpack(webpackConfig({ production: true }), (error, status) => {
        if (error) {
          expect(error).toBeInstanceOf(Error);
          reject(error);
        }

        const json = (status as unknown as any).toJson();
        expect(json?.assetsByChunkName?.client.length).toEqual(2);

        const clientJs = json?.assets?.find((a: { name: string, size: number }) => /^client\..*\.js$/.test(a.name));
        expect(clientJs).toBeDefined();
        expect(clientJs!.size < 75000).toBeTruthy();

        accept();
      });
    });
  });
});
