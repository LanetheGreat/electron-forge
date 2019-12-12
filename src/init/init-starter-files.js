import debug from 'debug';
import fs from 'fs-extra';
import path from 'path';

import asyncOra from '../util/ora-handler';

const d = debug('@lanethegreat/electron-forge:init:starter-files');

export const copy = async (source, target) => {
  d(`copying "${source}" --> "${target}"`);
  await fs.copy(source, target);
};

export default async (dir, { lintStyle, copyCIFiles }) => {
  await asyncOra('Copying Starter Files', async () => {
    const tmplPath = path.resolve(__dirname, '../../tmpl');

    d('creating directory:', path.resolve(dir, 'src'));
    await fs.mkdirs(path.resolve(dir, 'src'));
    const rootFiles = ['_gitignore', '_compilerc'];
    if (copyCIFiles) rootFiles.push(...['_travis.yml', '_appveyor.yml']);
    if (lintStyle === 'airbnb') rootFiles.push('_eslintrc');
    const srcFiles = ['index.js', 'index.html'];

    await Promise.all(rootFiles.map((file) => copy(path.resolve(tmplPath, file), path.resolve(dir, file.replace(/^_/, '.')))));
    await Promise.all(srcFiles.map((file) => copy(path.resolve(tmplPath, file), path.resolve(dir, 'src', file))));
  });
};
