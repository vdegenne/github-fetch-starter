
import {fetch} from '../fetch';


suite('fetch', () => {
  test('fetches something that doesn\'t exists', () => {
    fetch('https://this.isafake.com/this/url/aint/exists');
  });
});
