import debug from 'debug';
import fs from 'fs-extra';
import isExactVersion from 'exact-version';
import path from 'path';
import readPackageJSON from './read-package-json';

const d = debug('@lanethegreat/electron-forge:project-resolver');

export default async (dir) => {
  let mDir = dir;
  let prevDir;
  while (prevDir !== mDir) {
    prevDir = mDir;
    const testPath = path.resolve(mDir, 'package.json');
    d('searching for project in:', mDir);
    if (await fs.pathExists(testPath)) { // eslint-disable-line no-await-in-loop
      const packageJSON = await readPackageJSON(mDir); // eslint-disable-line no-await-in-loop

      if (packageJSON.devDependencies && packageJSON.devDependencies['@lanethegreat/electron-prebuilt-compile']) {
        const version = packageJSON.devDependencies['@lanethegreat/electron-prebuilt-compile'];
        if (!isExactVersion(version)) {
          throw new Error(`You must depend on an EXACT version of "@lanethegreat/electron-prebuilt-compile" not a range (got "${version}")`);
        }
      } else {
        throw new Error('You must depend on "@lanethegreat/electron-prebuilt-compile" in your devDependencies');
      }

      if (packageJSON.config && packageJSON.config.forge) {
        d('electron-forge compatible package.json found in', testPath);
        return mDir;
      }
    }
    mDir = path.dirname(mDir);
  }
  return null;
};
