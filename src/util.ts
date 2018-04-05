import opn = require('opn');
import {writeFileSync} from 'fs';

export function stringifyCircular(obj: Object): string {
  const cache: object[] = [];
  return JSON.stringify(obj, (key, value) => {
    key;

    if (typeof value === 'object' && value !== null) {
      if (cache.indexOf(value) !== -1) {
        return;
      }
      cache.push(value);
    }
    return value;
  });
}

/**
 * This will open the browser a dump stringified object
 */
export async function browserStringify(obj: Object): Promise<void> {
  const json = stringifyCircular(obj);

  await writeFileSync('here.json', json);
  await opn('here.json');
}
