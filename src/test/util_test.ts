import * as assert from 'assert';

import {stringifyCircular} from '../util';

suite('Util', () => {
  test('It should stringify my value', () => {
    const a = {a: {}};
    a.a = a;

    const jsonstring = stringifyCircular(a);

    assert.equal(jsonstring, '{}');
  });
});
