/* main module */

const appName = '%appname%';
const testvar = '%testvalue%';

/* the following won't resolve the multi-line placeholders because it's not a
 * placeholder but just percentage symbols used as a different meaning */
const html = `
  <style>
    .style1 {
      width: 100%;
    }
    .style2 {
      height: 100%;
    }
  </style>
`;
