import * as chai from 'chai';
import * as fs from 'fs-extra';
import * as path from 'path';
import {Readable, Writable} from 'stream';

import * as replacer from '../replacer';

const assert = chai.assert;

const root = path.resolve(__dirname, '..', '..', 'test');

describe('Replacer', () => {
  let srcRoot: string;
  let tempRoot: string;
  let pkgFile: string;


  describe('class FileReplacerTranformer', () => {

    it('tranforms stream as expected', () => {
      // create the instream
      const instream = new Readable;
      // multi-placeholders
      instream.push('this is %adjective% %placeholder%');
      instream.push(null);

      // create the transform stream
      const tranformer = new replacer.FileReplacerTransformer(
          {'placeholder': 'great', 'adjective': 'very'});

      // create the outstream
      const outstream = new Writable;
      let _output = '';
      outstream._write = (chunk, enc, cb) => {
        _output += chunk.toString();
        cb();
      };

      // assert
      tranformer.on('end', () => assert.equal(_output, 'this is very great'));

      // do the piping
      instream.pipe(tranformer).pipe(outstream);
    });
  });


  describe('General replacement', () => {

    /**
     * Setup
     */
    beforeEach(() => {
      srcRoot = path.join(root, 'src');
      tempRoot = path.join(root, 'temp');

      // we create a temporary structure
      fs.copySync(srcRoot, tempRoot);

      pkgFile = path.join(tempRoot, 'package.json');
    });

    afterEach(() => { fs.removeSync(tempRoot); });


    it('replaces placeholders in file', async() => {

      // replace placeholder in the package.json
      await replacer.replaceInFile(pkgFile, {'appname': 'myprojectname'});

      // read-back the new content
      const content = fs.readFileSync(pkgFile);

      // assert the replacement is found
      assert.isAtLeast(content.toString().indexOf('myprojectname'), 0);
    });

    it('replaces placeholder in filenames', async() => {
      const filepath = path.join(tempRoot, '%appname%.ts');
      const newfilepath = path.join(tempRoot, 'myprojectname.ts');
      replacer.replaceInFilename(filepath, {'appname': 'myprojectname'});
      // the file shouldn't exist anymore
      assert.isFalse(fs.existsSync(filepath));
      // myprojectname.ts should exist
      assert.isTrue(fs.existsSync(newfilepath));
    });


    it('masterReplace replaces placeholders in file', async() => {
      // call the masterReplace function
      await replacer.masterReplace(
          tempRoot, {'appname': 'myprojectname', 'testvalue': 'hello'});

      // get the content of package.json
      const content = fs.readFileSync(tempRoot + '/myprojectname.ts');

      // assert the replacement is found
      assert.isAtLeast(content.toString().indexOf('myprojectname'), 0);
      assert.isAtLeast(content.toString().indexOf('hello'), 0);
    });


    it('masterReplace replaces filenames', async() => {
      const filepath = path.join(tempRoot, '%appname%.ts');
      const newfilepath = path.join(tempRoot, 'myprojectname.ts');
      // call the masterReplace function
      await replacer.masterReplace(tempRoot, {'appname': 'myprojectname'});
      // the file `%name%.ts` should be absent
      assert.isFalse(fs.existsSync(filepath));
      // and the file `myprojectname.ts` should be present
      assert.isTrue(fs.existsSync(newfilepath));
    });
  });
});
