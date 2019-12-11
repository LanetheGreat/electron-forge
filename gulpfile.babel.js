/* eslint-disable import/no-extraneous-dependencies */

import gulp, { series } from 'gulp';

import babel from 'gulp-babel';
import fs from 'fs';
import path from 'path';

function transpile() {
  return gulp.src('./src/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('./dist'));
}

function watch() {
  gulp.watch('./src/**/*.js', transpile);
}

function link(cb) {
  const files = fs.readdirSync(path.resolve(__dirname, './src'))
                  .filter((f) => f.endsWith('.js'));
  const packageJSON = require('./package.json');

  if (!fs.existsSync(path.resolve(__dirname, './dist'))) {
    fs.mkdirSync(path.resolve(__dirname, './dist'));
  }

  Object.keys(packageJSON.bin).forEach((binName) => {
    if (binName === 'electron-forge') return;

    if (packageJSON.bin[binName] === packageJSON.bin['electron-forge']) {
      files.forEach((fileName) => {
        fs.writeFileSync(
          path.resolve(__dirname, `./dist/${fileName.replace('electron-forge', binName)}`),
          `/* Auto-generated bin alias file */\nglobal.__LINKED_FORGE__ = true;\nrequire('./${fileName}');\n`
        );
      });
    }
  });
  cb();
}

exports.build = series(transpile, link);
exports.watch = watch;
