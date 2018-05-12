import * as commandLineArgs from 'command-line-args';
import {ArgDescriptor} from 'command-line-args';
import * as commandLineUsage from 'command-line-usage';
import * as fs from 'fs';
import latest = require('github-latest-release');
import {args} from './args';
import {fetchOptions, fetchBase, fetch} from './fetch';
import * as tar from 'tar';
import * as colors from 'colors';
import {masterReplace, getProjectPlaceholders} from './replacer';
import {question} from 'readline-sync';
import {safeLoad} from 'js-yaml';

// initializing ?
colors.green('');


export interface PlaceholderYaml {
  prompt?: string;
  default?: string;
}

export async function run() {
  const argsWithHelp: ArgDescriptor[] = args.concat(
      {name: 'help', description: 'Shows this help message', type: Boolean});

  let cliOptions: any;

  try {
    cliOptions = commandLineArgs(argsWithHelp);

    if (cliOptions.help || !cliOptions.starter) throw new Error()

  } catch (e) {
    printUsage(argsWithHelp);
    return;
  }


  const options: fetchOptions = {
    user: cliOptions.user,
    starter: cliOptions.starter,
    appname: cliOptions['app-name'],
    version: cliOptions.version
  }

  if (!options.appname) {
    const appname = question(`Application Name (${options.starter}): `);
    options.appname = appname ? appname : options.starter;
  }


  /**
   * We fetch the last version number if version was set to 'last'
   */
  if (options.version === 'last') {
    console.info('Fetching the version informations...');
    let info;
    try {
      info = await latest(options.user, options.starter);
      options.version = info.tag_name;
      console.info(`Version fetched (${info.tag_name})... OK`.green);
    } catch (e) {
      throw new Error('The repository couldn\'t be found'.red);
    }
  }



  /**
   * Let's create the directory or throw an Error if it already exist.
   */
  if (fs.existsSync(options.appname)) {
    throw new Error('Can\'t create the directory, it already exists.'.red);
  }

  try {
    fs.mkdirSync(options.appname);
    process.chdir(options.appname);
    console.info('Creating the directory... OK'.green);
  } catch (e) {
    throw new Error(
        'Couldn\'t make the directory. Verify you have the rights to write.'
            .red);
  }



  /**
   * We fetch the package
   */
  let filepath;
  try {
    filepath = await fetch(
        options, '.');  // '.' now refers to the previously created directory

    console.info(
        `Fetching "${fetchBase}/${options.user}/${options.starter}/tar.gz/${options.version}"... OK`
            .green);

  } catch (e) {
    process.chdir('..');
    fs.unlinkSync(options.appname);

    throw new Error(
        'Couldn\'t fetch the package. It may not exist or your connection dropped. Try again.'
            .red);
  }


  /**
   * We extract the package
   */
  try {
    await tar.x({file: filepath, strip: 1});
    console.info('Unpacking the archive... OK'.green);
  } catch (e) {
    process.chdir('..');
    fs.unlinkSync(options.appname);
    throw new Error(
        'An error occured while trying to unpack the archive. Corrupted ?'.red);
  }


  /**
   * Removing the archive
   */
  fs.unlinkSync(filepath);
  console.info('Deleting the archive... OK'.green);


  /**
   * Let's replace the placeholders in the project
   */
  // we should check first if there is a placeholders configuration file.
  fs.existsSync('.placeholders.yml');
  const placeholdersYaml =
      safeLoad(fs.readFileSync('.placeholders.yml').toString());

  const placeholders = {'appname': options.appname};

  if (cliOptions.placeholder) {
    for (const p of cliOptions.placeholder) {
      const parts = p.split('=');
      placeholders[parts[0]] = parts[1];
    }
  }

  // question for every missing placeholders
  const placeholdersInProject = await getProjectPlaceholders(process.cwd());

  for (const p of placeholdersInProject) {
    if (!(p in placeholders)) {
      let placeholderYaml: PlaceholderYaml =
          placeholdersYaml && placeholdersYaml[p];

      // what question ?
      let questionString = `${p}`;
      if (placeholderYaml && placeholderYaml.prompt) {
        questionString = placeholderYaml.prompt;
      }
      // question <=> value
      let placeholderValue = question(
          `${questionString}: `,
          {hideEchoBack: p.match(/passwd|password/gi) ? true : false});

      // if no answer
      // but has a default
      console.log(placeholderValue);
      if (!placeholderValue.length && placeholderYaml &&
          placeholderYaml.default) {
        placeholderValue = placeholderYaml.default;
      }
      // roll back on using the default placeholder if no value at last<
      if (!placeholderValue.length) {
        placeholderValue = `%${p}%`;
      }

      // place the value in the placeholders object.
      placeholders[p] = placeholderValue;
    }
    console.log(placeholders);
  }

  // time to replace the placeholders
  await masterReplace(process.cwd(), placeholders);
  console.info('Replacing the placeholders... OK'.green);


  console.info(
      `\n Success! The starter is waiting in '${options.appname}'`.green);

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
