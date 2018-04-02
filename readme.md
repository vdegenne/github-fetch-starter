# node-cli-starter

A starter for making a cli type program in NodeJs.


## installation

```bash
$ git clone https://github.com/vdegenne/node-cli-starter.git
```

Or use the tool `github-fetch-starter` as follow :

```bash
$ github-fetch-starter -u vdegenne -s node-cli-starter <cli-name>
```

Replace `<cli-name>` with your app name. More information about `github-fetch-starter` can be found [here](https://github.com/vdegenne/github-fetch-starter)

## Post-installation

- Install the dependencies : `yarn install`
- Replace all the uppercase placeholders in the `package.json` and rename the file under `./bin` to the same name of the placeholder `RENAME` in `package.json`.
- Also change the `RENAME` accordingly in the file you just renamed under `./bin`.

- Change `tsconfig.json` to your needs.
- Edit the sources under `./src`
- You can run `yarn run watch` to automatically compile your `.ts` files.


## Run the application

- the starter is using the bin file under `./bin` to invoke the program. You can run using `./bin/<app-name>` (replace `<app-name>` with the name you replaced in the **Post-installation** section). The file is configure to run `node` as the invoker. If your system struggles to pick `node` as the launcher, it may be having trouble to understand the *shebang* in the file. You can just run using `node ./bin/<app-name>`.

*(Note: if you are making a `script` in `package.json` to launch your application, write the arguments directly in the command and not when you call `yarn run <script-name>` because the process won't pass the arguments to the underlying call. For instance if you have a script `"start": "./bin/<app-name>"`, running `yarn run start --arg1=value` is same as just running `yarn run start`.)*