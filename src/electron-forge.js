#!/usr/bin/env node
import 'colors';
import program from 'commander';
import tabtab from 'tabtab';

import './util/terminate';
import asyncOra from './util/ora-handler';
import checkSystem from './util/check-system';
import config from './util/config';

const originalSC = program.executeSubCommand.bind(program);
program.executeSubCommand = (argv, args, unknown) => {
  let indexOfDoubleDash = process.argv.indexOf('--');
  indexOfDoubleDash = indexOfDoubleDash < 0 ? process.argv.length + 1 : indexOfDoubleDash;

  const passThroughArgs = args.filter((arg) => process.argv.indexOf(arg) > indexOfDoubleDash);
  const normalArgs = args.filter((arg) => process.argv.indexOf(arg) <= indexOfDoubleDash);

  let newArgs = args;
  let newUnknown = unknown;
  if (passThroughArgs.length > 0) {
    newArgs = normalArgs.concat(unknown).concat('--').concat(passThroughArgs);
    newUnknown = [];
  }
  return originalSC(argv, newArgs, newUnknown);
};

program
  .version(require('../package.json').version)
  .option('--verbose', 'Enables verbose mode')
  .command('init', 'Initialize a new Electron application')
  .command('import', 'Attempts to navigate you through the process of importing an existing project to "electron-forge"')
  .command('lint', 'Lints the current Electron application')
  .command('package', 'Package the current Electron application')
  .command('make', 'Generate distributables for the current Electron application')
  .command('start', 'Start the current Electron application')
  .command('publish', 'Publish the current Electron application to GitHub')
  .command('install', 'Install an Electron application from GitHub');

const tab = tabtab({
  name: 'electron-forge',
});
tab.on('electron-forge', (data, done) => {
  if (data.line.split(' ').length <= 2) {
    done(
      null,
      program.commands
        .filter((cmd) => cmd._name.startsWith(data.lastPartial))
        .map((cmd) => `${cmd._name}:${cmd._description}`).sort(),
    );
  } else {
    done(null, []);
  }
});
tab.start();

if (process.argv[2] !== 'completion') {
  (async () => {
    let goodSystem;
    await asyncOra('Checking your system', async (ora) => {
      goodSystem = await checkSystem(ora);
    });

    if (!goodSystem) {
      console.error(('It looks like you are missing some dependencies you need to get Electron running.\n'
                    + 'Make sure you have git installed and Node.js version 8.0.0+').red);
      process.exit(1);
    }

    program.parse(process.argv);

    config.reset();
    config.set('verbose', !!program.verbose);
  })();
}
