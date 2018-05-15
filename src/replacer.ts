import {createReadStream, createWriteStream, existsSync, lstatSync, readFileSync, readdirSync, renameSync, unlinkSync} from 'fs';
import {basename, dirname, join, resolve} from 'path';
import * as stream from 'stream';


export interface Replacements { [from: string]: string }


/**
 * From `rootpath`, replaces placeholders in files and and renames files having
 * the placeholder.
 * It doesn't replace the placeholders in directory names.
 */
export function masterReplace(
    rootpath: string, replacements: Replacements): Promise<{}>|Error {
  return new Promise(async(resolve, reject) => {

    const files = readdirSync(rootpath);

    for (let i = 0, length = files.length; i < length; ++i) {
      const f = files[i];
      const filepath = join(rootpath, f);
      // in the case of a directory
      if (lstatSync(filepath).isDirectory()) {
        await masterReplace(filepath, replacements);
      } else {
        try {
          const newfilepath = await replaceInFilename(filepath, replacements);
          await replaceInFile(newfilepath, replacements);
        } catch (e) {
          throw e;
        }
      }
    }
    resolve();
  });
}


/**
 *
 * returns the name of the new filepath, changed or not.
 */
export async function replaceInFilename(
    filepath: string, replacements: Replacements): Promise<string> {
  if (!existsSync(filepath)) {
    throw new Error('The file doesn\'t exist.');
  }

  let replacement: string, replaceRegExp: RegExp;
  // paths and names
  const dirpath = dirname(filepath);
  const filename = basename(filepath);
  let newfilename: string = '';  // this is the name of the file if renamed

  for (replacement in replacements) {
    // the placeholder was found
    if (filename.indexOf(replacement) >= 0) {
      replaceRegExp = new RegExp(`%${replacement}%`, 'g');
      newfilename = filename.replace(replaceRegExp, replacements[replacement]);

      // we should move the file from here.
      renameSync(filepath, join(dirpath, newfilename));
    }
  }

  if (!newfilename) {
    // the filename is the same
    newfilename = filename;
  }
  return resolve(dirpath, newfilename);
}
/**
 *
 */
export function replaceInFile(
    filepath: string, replacements: Replacements): Promise<void> {
  return new Promise((resolve, reject) => {

    if (!existsSync(filepath)) {
      reject(new Error('The file doesn\'t exist.'));
    }

    // dummy check if file contains placeholders
    if (!readFileSync(filepath).toString().match(/%/)) {
      resolve();
      return;
    }

    // if the file exists
    // let's prepare the replacer
    const replacer = new FileReplacerTransformer(replacements);
    // we create the readStream from the file
    const infile = createReadStream(filepath);
    const outfile = createWriteStream(filepath + '.temp');

    infile.pipe(replacer)
        .pipe(outfile)
        .on('finish',
            () => {
              unlinkSync(filepath);
              renameSync(filepath + '.temp', filepath);
              resolve();
            })
        .on('error', (e) => reject(e));

  });
}


/**
 *
 */
export class FileReplacerTransformer extends stream.Transform {
  private replacements: {from: RegExp, to: string}[];

  constructor(replacements: Replacements, opts?: stream.TransformOptions) {
    super(opts);

    // initialize replacements
    this.replacements = [];

    let replacement;
    for (replacement in replacements) {
      this.replacements.push({
        from: new RegExp(`%${replacement}%`, 'g'),
        to: replacements[replacement]
      });
    }
  }

  _transform(chunk: any, encoding: string, callback: Function) {
    let newChunk = chunk.toString();
    let replacement;
    for (replacement of this.replacements) {
      newChunk = newChunk.replace(replacement.from, replacement.to);
    }
    this.push(newChunk);
    callback();
  }
}


export async function getProjectPlaceholders(path: string): Promise<string[]> {
  let placeholders: string[] = [];
  const files = readdirSync(path);
  for (const f of files) {
    const filepath = join(path, f);
    if (lstatSync(filepath).isDirectory()) {
      placeholders =
          placeholders.concat(await getProjectPlaceholders(filepath));
    } else {
      const findings = readFileSync(filepath).toString().match(/%([^%\n]+)%/gi);
      if (findings) {
        placeholders = placeholders.concat(
            findings.map(f => f.substring(1, f.length - 1)));
      }
    }
  }

  return [...new Set(placeholders)];
}
