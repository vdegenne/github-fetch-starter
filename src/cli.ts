/// <reference path="../custom_typings/command-line-args.d.ts" />

import * as commandLineArgs from 'command-line-args';
import {ArgDescriptor} from 'command-line-args';
import * as commandLineUsage from 'command-line-usage';

var latest = require('github-latest-release');
import {args} from './args';


export interface Options {
  user: string;
  starter: string;
  version: string;
  'app-name': string
}


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



  const options: Options = {
    user: cliOptions.user,
    starter: cliOptions.starter,
    'app-name': cliOptions['app-name'],
    version: cliOptions.version
  }

  if (!options['app-name']) {
    options['app-name'] = options.starter;
  }

  let version: string = cliOptions.version;
  if (version === 'last') {
    console.log('Fetch the version informations......');
    await latest(options.user, options['app-name']).then((info: any) => {
      console.log(`Version fetched (${info.tag_name}).`);
      options.version = info.tag_name;
    })
  }



  // download the distant file
  console.log('Downloading the package.......');

  // wait for the file to be fetched
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
