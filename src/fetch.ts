
import { createWriteStream } from 'fs';
import { IncomingMessage } from 'http';
import * as https from 'https';
import * as Path from 'path';
import * as logging from 'plylog';


const logger = logging.getLogger('fetch.main');



export interface fetchOptions {
  user: string;
  starter: string;
  version: string;
  appName: string;
}



export const fetchBase = 'https://codeload.github.com/';



export function fetch(options: fetchOptions, path: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const url = fetchBase.concat(
      `${options.user}/${options.starter}/tar.gz/${options.version}`);

    let response: IncomingMessage;
    try {
      logger.debug(`Fetch ${url}`);
      response = await get(url);
    } catch (err) {
      reject(err);
      return;
    }

    if (response.statusCode) {
      logger.debug('statusCode : ', response.statusCode.toString());
    }


    if (response.statusCode == 200) {
      path = Path.resolve(path, options.version + '.tar.gz');
      let stream = createWriteStream(path);
      response.pipe(stream);

      stream.on('finish', () => resolve(path))
    } else {
      reject(new Error('The starter doesn\'t exist. Please verify the name.'));
    }
  })
}



function get(url: string): Promise<IncomingMessage> {
  return new Promise((resolve, reject) => {
    const cr = https.get(url, (res: IncomingMessage) => {
      resolve(res);
    });
    cr.on('error', (e: Error) => {
      reject(e);
    });
  });
}

/* await fetch()
    .then(async (res: any) => {
      // if the link found an archive, we create the directory
      const isdir =
          await isDirectory(path.join(process.cwd(), options['app-name']));

      if (isdir) {
        console.error(`The directory ${options['app-name']} already exists.`);
        return;
      }



      isDirectory.sync('test', (err, dir) => {
        if (err)
          throw err;
        console.log(dir);
        console.log('this is in isDir');
      });
      console.log('this is out of dir');

      const file = fs.createWriteStream(`${options.version}.tar.gz`);

      res.pipe(file);
      file.on('finish', () => {
        file.close();
      })
    })
    .catch((err: Error) => {
      console.error(
          'The starter can\'t be found.Verify the syntax and try again.');
      console.error(err.message);
      return;
    });
 */
