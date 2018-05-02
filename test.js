const commandLine = require('command-line-args');

const args = [{
  name: 'testy',
  alias: 't',
  type: String,
  multiple: true,
}];


const options = commandLine(args);

console.log(options);
