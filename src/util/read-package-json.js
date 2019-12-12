import fs from 'fs-extra';
import path from 'path';

export default async (dir) => fs.readJson(path.resolve(dir, 'package.json'));
