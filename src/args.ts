/// <reference path="../custom_typings/command-line-args.d.ts" />
import {ArgDescriptor} from 'command-line-args';

export const args: ArgDescriptor[] = [
  {
    name: 'user',
    alias: 'u',
    description: 'The github username as it displays on the website.',
    type: String,
    defaultValue: 'vdegenne'
  },
  {
    name: 'starter',
    description:
        'The name of the remote starter. Basically the user\'s repository name you want to clone.',
    type: String,
    defaultOption: true
  },
  {
    name: 'version',
    alias: 'v',
    description:
        'The version of the remote starter. If not specified, defaults to last version.',
    type: String,
    defaultValue: 'last'
  },
  {
    name: 'app-name',
    alias: 'n',
    description: 'Your app name as it\'ll appear in the file-system',
    type: String
  }
];