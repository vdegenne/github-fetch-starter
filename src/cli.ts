/// <reference path="../custom_typings/command-line-args.d.ts" />

import * as commandLineArgs from 'command-line-args';
import {ArgDescriptor} from 'command-line-args';
import * as commandLineUsage from 'command-line-usage';
import * as fs from 'fs';
import latest = require('github-latest-release');
import {args} from './args';
import {fetchOptions, fetchBase, fetch} from './fetch';



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
   * Let's create the directory or throw an Error if it already exist.
   */
  if (fs.existsSync(options.appName)) {
    console.error('Can\'t create the directory, it already exists.');
    return;
  } else {
    try {
      fs.mkdirSync(options.appName);
      process.chdir(options.appName);
    } catch (e) {
      console.error(
          'Couldn\'t make the directory. Verify you have the rights to write.');
      return;
    }
  }

  /**
   * We fetch the version if we request for 'last'
   */
  let version: string = cliOptions.version;
  if (version === 'last') {
    console.info('Fetching the version informations...');
    const info = await latest(options.user, options.starter);
    options.version = info.tag_name;
    console.info(`Version fetched (${info.tag_name}).`);
  }


  /**
   * We fetch the package
   */
  console.info(
      `Fetching "${fetchBase}/${options.user}/${options.starter}/tar.gz/${options.version}"..`);
  let filepath;
  try {
    filepath = await fetch(options, options.appName);
  } catch (err) {
    console.error(
        'Couldn\'t fetch the package. It may not exist or your connection dropped. Try again.');
    process.chdir('..');
    fs.unlinkSync(options.appName);
    return;
  }


  filepath;
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
