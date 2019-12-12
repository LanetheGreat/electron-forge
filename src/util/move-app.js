import fs from 'fs-extra';
import inquirer from 'inquirer';
import path from 'path';
import pify from 'pify';
import sudo from 'sudo-prompt';
import { exec } from 'child_process';

export default async (appPath, targetApplicationPath, spinner, copyInstead = false) => {
  let writeAccess = true;
  try {
    await fs.access('/Applications', fs.W_OK);
  } catch (err) {
    writeAccess = false;
  }

  if (await fs.pathExists(targetApplicationPath)) {
    spinner.stop();
    const { confirm } = await inquirer.createPromptModule()({
      type: 'confirm',
      name: 'confirm',
      message: `The application "${path.basename(targetApplicationPath)}" appears to already exist in /Applications. Do you want to replace it?`,
    });
    if (!confirm) {
      throw new Error('Installation stopped by user');
    } else {
      spinner.start();
      await fs.remove(targetApplicationPath);
    }
  }

  const moveCommand = `${copyInstead ? 'cp -r' : 'mv'} "${appPath}" "${targetApplicationPath}"`;
  if (writeAccess) {
    await pify(exec)(moveCommand);
  } else {
    await pify(sudo.exec)(moveCommand, {
      name: 'Electron Forge',
    });
  }
};
