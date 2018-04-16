/// <reference path="../custom_typings/command-line-args.d.ts" />

import * as commandLineArgs from 'command-line-args';
import {ArgDescriptor} from 'command-line-args';
import * as commandLineUsage from 'command-line-usage';
import * as fs from 'fs';
import latest = require('github-latest-release');
import {args} from './args';
import {fetchOptions, fetchBase, fetch} from './fetch';
import * as tar from 'tar';
import * as colors from 'colors';
import {masterReplace} from './replacer';

// initializing ?
colors.green('');

export async function run() {
  const argsWithHelp: ArgDescriptor[] = args.concat(
      {name: 'help', description: 'Shows this help message', type: Boolean});

  let cliOptions: any;

  try {
    cliOptions = commandLineArgs(argsWithHelp);
  } catch (e) {
    printUsage(argsWithHelp);
    return;
  }

  if (cliOptions.help) {
    printUsage(argsWithHelp);
    return;
  }

  /**
   * Start your program HERE
   */
  if (!cliOptions.starter) {
    printUsage(argsWithHelp);
    return;
  }

  const options: fetchOptions = {
    user: cliOptions.user,
    starter: cliOptions.starter,
    appName: cliOptions['app-name'],
    version: cliOptions.version
  }

  if (!options.appName) {
    options.appName = options.starter;
  }

  /**
   * We fetch the version if we request for 'last'
   */
  let version: string = cliOptions.version;
  if (version === 'last') {
    console.info('Fetching the version informations...');
    let info;
    try {
      info = await latest(options.user, options.starter);
    } catch (err) {
      console.log('The repository couldn\'t be found');
      return;
    }
    options.version = info.tag_name;
    console.info(`Version fetched (${info.tag_name}).`);
  }



  /**
   * Let's create the directory or throw an Error if it already exist.
   */
  if (fs.existsSync(options.appName)) {
    console.error('Can\'t create the directory, it already exists.'.red);
    return;
  } else {
    try {
      fs.mkdirSync(options.appName);
      process.chdir(options.appName);
    } catch (e) {
      console.error(
          'Couldn\'t make the directory. Verify you have the rights to write.'
              .red);
      return;
    }
  }
  console.info('Creating the directory... OK');

  /**
   * We fetch the package
   */
  let filepath;
  try {
    // we've changed the cwd, so the path is currently the current directory,
    // hence '.'
    filepath = await fetch(options, '.');
  } catch (err) {
    console.error(
        'Couldn\'t fetch the package. It may not exist or your connection dropped. Try again.'
            .red);
    process.chdir('..');
    fs.unlinkSync(options.appName);
    return;
  }
  console.info(
      `Fetching "${fetchBase}/${options.user}/${options.starter}/tar.gz/${options.version}"... OK`);


  /**
   * We extract the package
   */
  try {
    await tar.x({file: filepath, strip: 1});
  } catch (err) {
    console.error(
        'An error occured while trying to unpack the archive. Corrupted ?'.red);
    process.chdir('..');
    fs.unlinkSync(options.appName);
    return;
  }
  console.info('Unpacking the archive... OK');

  /**
   * Removing the archive
   */
  fs.unlinkSync(filepath);
  console.info('Deleting the archive... OK');

  console.info(
      `\n Success! The starter is waiting in '${options.appName}'`.green);


  /**
   * Let's replace what needs to be replaced.
   *
   */
  // todo: later we could add custom replacements to search for in the fetched
  // starter.
  // for now it will just replace `%appname%` in the filenames and inside file's
  // content with the name of the application provided.
  masterReplace(process.cwd(), {'appname': options.appName});

  return;
}



function printUsage(options: any): void {
  const usage = [
    {
      header: 'Usage',
      content: 'github-fetch-starter [options ...] <starter-name>'
    },
    {header: 'Options', optionList: options}
  ];
  console.log(commandLineUsage(usage));
}
