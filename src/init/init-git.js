import { exec } from 'child_process';
import debug from 'debug';
import fs from 'fs-extra';
import path from 'path';
import pify from 'pify';

import asyncOra from '../util/ora-handler';

const d = debug('@lanethegreat/electron-forge:init:git');

export default async (dir) => {
  asyncOra('Initializing Git Repository', async () => {
    if (await fs.pathExists(path.resolve(dir, '.git'))) {
      d('.git directory already exists, skipping git initialization');
      return;
    }
    d('executing "git init" in directory:', dir);
    await pify(exec)('git init', { cwd: dir });
  });
};
