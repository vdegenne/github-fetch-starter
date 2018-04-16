import * as fs from 'fs';
import * as path from 'path';
import * as stream from 'stream';


export interface Replacements { [from: string]: string }


/**
 * From `rootpath`, replaces placeholders in files and and renames files having
 * the placeholder.
 * It doesn't replace the placeholders in directory names.
 */
export function masterReplace(
    rootpath: string, replacements: Replacements): Promise<void|Error> {
  return new Promise(async(resolve, reject) => {
    const files = fs.readdirSync(rootpath);
    for (const f of files) {
      const filepath = path.join(rootpath, f);
      // in the case of a directory
      if (fs.lstatSync(filepath).isDirectory()) {
        masterReplace(filepath, replacements)
            .then(() => {
              resolve();
            })
            .catch((err) => {
              reject(err);
            })
      } else {  // if it is a file
        // we try to replace the name if any placeholder
        replaceInFilename(filepath, replacements)
            .then((filepath) => {
              // then we try to replace any placeholder inside
              replaceInFile(filepath, replacements)
                  .then(() => {
                    resolve();
                  })
                  .catch((err) => {
                    reject(err);
                  });
            })
            .catch((err) => {
              reject(err);
            });
      }
    }
  });
}


/**
 *
 * returns the name of the new filepath, changed or not.
 */
export async function replaceInFilename(
    filepath: string, replacements: Replacements): Promise<string> {
  if (!fs.existsSync(filepath)) {
    throw new Error('The file doesn\'t exist.');
  }

  let replacement: string, replaceRegExp: RegExp;
  // paths and names
  const dirpath = path.dirname(filepath);
  const filename = path.basename(filepath);
  let newfilename: string = '';  // this is the name of the file if renamed

  for (replacement in replacements) {
    // the placeholder was found
    if (filename.indexOf(replacement) >= 0) {
      replaceRegExp = new RegExp(`%${replacement}%`, 'g');
      newfilename = filename.replace(replaceRegExp, replacements[replacement]);

      // we should move the file from here.
      fs.renameSync(filepath, path.join(dirpath, newfilename));
    }
  }

  if (!newfilename) {
    // the filename is the same
    newfilename = filename;
  }
  return path.resolve(dirpath, newfilename);
}
/**
 *
 */
export function replaceInFile(
    filepath: string, replacements: Replacements): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filepath)) {
      throw new Error('The file doesn\'t exist.');
    }

    // if the file exists
    // let's prepare the replacer
    const replacer = new FileReplacerTransformer(replacements);
    // we create the readStream from the file
    const file = fs.createReadStream(filepath);

    // we do the piping with the tranformer
    file.pipe(replacer);
    file.on('end', () => {
      // we can replace the original file with the new content
      const file = fs.createWriteStream(filepath);
      replacer.pipe(file);
      file.on('finish', () => {
        resolve();
      });
    });
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
