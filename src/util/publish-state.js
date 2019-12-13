import crypto from 'crypto';
import fs from 'fs-extra';
import path from 'path';
import { promiseSequence } from './promise-sequence';

const EXTENSION = '.forge.publish';

export default class PublishState {
  static async loadFromDirectory(directory, rootDir) {
    if (!await fs.exists(directory)) {
      throw new Error(`Attempted to load publish state from a missing directory: ${directory}`);
    }

    const publishes = [];
    await promiseSequence(await fs.readdir(directory), async (dirName) => {
      const subDir = path.resolve(directory, dirName);
      const states = [];
      if ((await fs.stat(subDir)).isDirectory()) {
        const filePaths = (await fs.readdir(subDir))
          .filter((fileName) => fileName.endsWith(EXTENSION))
          .map((fileName) => path.resolve(subDir, fileName));

        await promiseSequence(filePaths, async (filePath) => {
          const state = new PublishState(filePath);
          await state.load();
          state.state.artifacts = state.state.artifacts.map((artifactPath) => path.resolve(rootDir, artifactPath));
          states.push(state);
        })();
      }
      publishes.push(states);
    })();
    return publishes;
  }

  static async saveToDirectory(directory, artifacts, rootDir) {
    const id = crypto.createHash('SHA256').update(JSON.stringify(artifacts)).digest('hex');
    await promiseSequence(artifacts, async (artifact) => {
      // eslint-disable-next-line no-param-reassign
      artifact.artifacts = artifact.artifacts.map((artifactPath) => path.relative(rootDir, artifactPath));
      const state = new PublishState(path.resolve(directory, id, 'null'), '', false);
      state.setState(artifact);
      await state.saveToDisk();
    })();
  }

  constructor(filePath, hasHash = true) {
    this.dir = path.dirname(filePath);
    this.path = filePath;
    this.hasHash = hasHash;
  }

  generateHash() {
    const content = JSON.stringify(this.state || {});
    return crypto.createHash('SHA256').update(content).digest('hex');
  }

  setState(state) {
    this.state = state;
  }

  async load() {
    this.state = await fs.readJson(this.path);
  }

  async saveToDisk() {
    if (!this.hasHash) {
      this.path = path.resolve(this.dir, `${this.generateHash()}${EXTENSION}`);
      this.hasHash = true;
    }

    await fs.mkdirs(path.dirname(this.path));
    await fs.writeJson(this.path, this.state);
  }
}
