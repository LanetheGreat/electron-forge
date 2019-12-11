import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import path from 'path';
import proxyquire from 'proxyquire';
import { stub } from 'sinon';

chai.use(chaiAsPromised);

describe('deb maker', () => {
  let debModule;
  let debMaker;
  let eidStub;
  let ensureFileStub;
  let forgeConfig;

  const dir = '/my/test/dir/out';
  const appName = 'My Test App';
  const targetArch = process.arch;
  const packageJSON = { version: '1.2.3' };

  beforeEach(() => {
    ensureFileStub = stub().returns(Promise.resolve());
    eidStub = stub().resolves();
    eidStub.transformVersion = (version) => version;
    forgeConfig = { electronInstallerDebian: {} };

    debModule = proxyquire.noPreserveCache().noCallThru().load('../../../src/makers/linux/deb', {
      './config-fn': (config) => config,
      '../../util/ensure-output': { ensureFile: ensureFileStub },
      'electron-installer-debian': eidStub,
    });
    debMaker = debModule.default;
  });

  it('should pass through correct defaults', async () => {
    // eslint-disable-next-line object-curly-newline
    await debMaker({ dir, appName, targetArch, forgeConfig, packageJSON });
    const opts = eidStub.firstCall.args[0];
    expect(opts).to.deep.equal({
      arch: debModule.debianArch(process.arch),
      options: {},
      src: dir,
      dest: path.resolve(dir, '..', 'make'),
    });
  });

  it('should have config cascade correctly', async () => {
    forgeConfig.electronInstallerDebian = {
      arch: 'overridden',
      options: {
        productName: 'Debian',
      },
    };

    // eslint-disable-next-line object-curly-newline
    await debMaker({ dir, appName, targetArch, forgeConfig, packageJSON });
    const opts = eidStub.firstCall.args[0];
    expect(opts).to.deep.equal({
      arch: debModule.debianArch(process.arch),
      options: {
        productName: 'Debian',
      },
      src: dir,
      dest: path.resolve(dir, '..', 'make'),
    });
  });

  if (process.platform === 'linux') {
    it('should return the proper pre-release version in the outPath', async () => {
      eidStub.transformVersion = require('electron-installer-debian').transformVersion;

      packageJSON.version = '1.2.3-beta.4';
      // eslint-disable-next-line object-curly-newline
      const outPath = await debMaker({ dir, appName, targetArch, forgeConfig, packageJSON });
      expect(outPath).to.match(/1\.2\.3~beta\.4/);
    });
  }
});
