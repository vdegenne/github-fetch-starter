import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as fs from 'fs';
import {resolve} from 'path';
import * as logging from 'plylog';
import {v1 as uuidv1} from 'uuid';

import {fetch, fetchOptions} from '../fetch';

/* const hum = path.resolve('test-fixtures/test.html'); */



chai.use(chaiAsPromised);
const assert = chai.assert;


logging.setQuiet();

suite('Fetch:', () => {
  let options: fetchOptions;
  let originalCwd: string;

  setup(() => {
    options = {
      user: 'vdegenne',
      starter: 'node-cli-starter',
      version: 'v1.0.1',
      appName: 'a test'
    };

  });


  before(() => {
    originalCwd = process.cwd();
    process.chdir(resolve(__dirname, '../../test'));
  });



  after(() => {
    process.chdir(originalCwd);
  });



  test('fetches something that doesn\'t exist', async() => {
    // generate a fake version
    options.version = uuidv1();

    return chai.expect(fetch(options, '.'))
        .to.eventually.be.rejectedWith(Error);
  });



  test('Fetching makes the file available on the FS', () => {

    return fetch(options, '.').then(filepath => {
      const fileStat = fs.statSync(filepath);

      assert.equal(fileStat.size, 5675);

      fs.unlinkSync(filepath);
    });
  });
});
