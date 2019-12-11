import path from 'path';

import { ensureDirectory } from '../../util/ensure-output';
import getNameFromAuthor from '../../util/author-name';
import configFn from '../../util/config-fn';

// electron-wix-msi doesn't set its 'os' field even though it only runs on win32
export const isSupportedOnCurrentPlatform = async () => process.platform === 'win32';

// eslint-disable-next-line object-curly-newline
export default async ({ dir, appName, targetArch, forgeConfig, packageJSON }) => {
  const { MSICreator } = require('electron-wix-msi');

  const outPath = path.resolve(dir, `../make/wix/${targetArch}`);
  await ensureDirectory(outPath);

  const creator = new MSICreator({
    description: packageJSON.description,
    name: appName,
    version: packageJSON.version,
    manufacturer: getNameFromAuthor(packageJSON.author),
    exe: `${appName}.exe`,
    ...configFn(forgeConfig.electronWixMSIConfig, targetArch),
    appDirectory: dir,
    outputDirectory: outPath,
  });

  await creator.create();
  const { msiFile } = await creator.compile();

  return [msiFile];
};
