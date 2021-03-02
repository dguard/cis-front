'use strict';
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

process.on('unhandledRejection', err => {
  throw err;
});
require('../react-scripts-config/env');

const fs = require('fs-extra');
const webpack = require('webpack');
const configFactory = require('../react-scripts-config/webpack.config');
const paths = require('../react-scripts-config/paths');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');

const chalk = require('react-dev-utils/chalk');
const moment = require('moment');
const config = configFactory('production');


const FileSizeReporter = require('react-dev-utils/FileSizeReporter');
const measureFileSizesBeforeBuild =
  FileSizeReporter.measureFileSizesBeforeBuild;
const printFileSizesAfterBuild = FileSizeReporter.printFileSizesAfterBuild;

// These sizes are pretty large. We'll warn for bundles exceeding them.
const WARN_AFTER_BUNDLE_GZIP_SIZE = 512 * 1024;
const WARN_AFTER_CHUNK_GZIP_SIZE = 1024 * 1024;


function log(message) {
  const timestamp = moment(Number(new Date())).format('YYYY-MM-DD HH:mm:ss').trim();
  // eslint-disable-next-line no-console
  console.log(`${chalk.cyan("[cis-web]")} ${chalk.magenta(timestamp)} [build] - ${message}`);
}

let startedTime;
let _previousFileSizes;

new Promise((resolve, reject) => {
  return measureFileSizesBeforeBuild(paths.appBuild).then(resolve);
}).then((previousFileSizes) => {
  _previousFileSizes = previousFileSizes;

  startedTime = new Date();
  log(`${chalk.green('Copy files into build directory')}`);
  fs.emptyDirSync(paths.appBuild);
  // Merge with the public folder
  copyPublicFolder();

  // Start the webpack build
  return build();
})
.then(({ stats, previousFileSizes, warnings }) => {
  const takenTime = new Date() - startedTime;
  const hours = Math.trunc(takenTime / 60 / 60 / 1000);
  const minutes = Math.trunc((takenTime - (hours * 60 * 60 * 1000)) / 60 / 1000);
  const seconds = Math.trunc((takenTime - (hours * 60 * 60 * 1000) - (minutes * 60 * 1000)) / 1000);
  const milliseconds = takenTime % 1000;

  log(`${chalk.green('Compiled successfully')} in ${minutes ? minutes + 'm ' : ''}${seconds}.${String(milliseconds).slice(0, 2)}s`);

  // eslint-disable-next-line no-console
  console.log('File sizes after gzip:\n');
  printFileSizesAfterBuild(
    stats,
    _previousFileSizes,
    paths.appBuild,
    WARN_AFTER_BUNDLE_GZIP_SIZE,
    WARN_AFTER_CHUNK_GZIP_SIZE
  );
  // eslint-disable-next-line no-console
  console.log();

  /*
  if (warnings.length) {
    console.log(chalk.yellow('Compiled with warnings.\n'));
    console.log(warnings.join('\n'));
    console.log(
      '\nSearch for the ' +
      chalk.underline(chalk.yellow('keywords')) +
      ' to learn more about each warning.'
    );
    console.log(
      'To ignore, add ' +
      chalk.cyan('// eslint-disable-next-line') +
      ' to the line before.\n'
    );
  }*/
})
.catch(err => {
  if (err && err.message) {
    // eslint-disable-next-line no-console
    console.log(err.message);
  }
  process.exit(1);
});

function build() {
  const compiler = webpack(config);
  return new Promise((resolve, reject) => {
    log(`${chalk.green('Started compiling')}`);
    compiler.run((err, stats) => {
      let messages;
      if (err) {
        // eslint-disable-next-line no-console
        console.error(err.stack || err);
        if (err.details) {
          // eslint-disable-next-line no-console
          console.error(err.details);
        }

        if (!err.message) {
          return reject(err);
        }
        let errMessage = err.message;

        messages = formatWebpackMessages({
          errors: [errMessage],
          warnings: [],
        });
      } else {
        messages = formatWebpackMessages(
          stats.toJson({ all: false, warnings: true, errors: true })
        );
      }

      const info = stats.toJson();

      if (stats.hasErrors()) {
        // eslint-disable-next-line no-console
        console.error(info.errors);
      }

      // if (stats.hasWarnings()) {
      //   console.warn(info.warnings);
      // }

      if (messages.errors.length) {
        // Only keep the first error. Others are often indicative
        // of the same problem, but confuse the reader with noise.
        if (messages.errors.length > 1) {
          messages.errors.length = 1;
        }
        return reject(new Error(messages.errors.join('\n\n')));
      }

      return resolve({
        stats,
        // previousFileSizes,
        warnings: messages.warnings,
      });
    })
  });
}

function copyPublicFolder() {
  fs.copySync(paths.appPublic, paths.appBuild, {
    dereference: true,
    filter: file => file !== paths.appHtml,
  });
}
