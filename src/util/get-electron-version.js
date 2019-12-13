import debug from 'debug';
import path from 'path';
import readPackageJSON from './read-package-json';

const d = debug('@lanethegreat/electron-forge:util');

export default async (projectDir) => {
  let result = null;

  const modulesToExamine = ['@lanethegreat/electron-prebuilt-compile', 'electron', 'electron-prebuilt'];
  // eslint-disable-next-line no-restricted-syntax
  for (const moduleName of modulesToExamine) {
    const moduleDir = path.join(projectDir, 'node_modules', moduleName);
    try {
      const packageJSON = await readPackageJSON(moduleDir); // eslint-disable-line no-await-in-loop
      result = packageJSON.version;
      break;
    } catch (e) {
      d(`Could not read package.json for moduleName=${moduleName}`, e);
    }
  }

  if (!result) {
    d(`getElectronVersion failed to determine Electron version: projectDir=${projectDir}, result=${result}`);
  }

  return result;
};
