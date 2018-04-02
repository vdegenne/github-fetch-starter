
import {IncomingMessage} from 'http';
import * as https from 'https';
import * as logging from 'plylog';

const logger = logging.getLogger('fetch.main');


export async function fetch(url: string): Promise<IncomingMessage> {
  logger.info(`Fetching "${url}"`);

  let response: IncomingMessage;
  response = await get(url);
  logger.info(response.statusCode.toString());

  return response;
}

async function get(url: string) {
  let response;
  https.get(url, (res: IncomingMessage) => {response = res});
  return response;
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
