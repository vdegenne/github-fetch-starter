[![Build Status](https://travis-ci.org/vdegenne/github-fetch-starter.svg?branch=master)](https://travis-ci.org/vdegenne/github-fetch-starter)
[![npm](https://img.shields.io/npm/v/github-fetch-starter.svg)](https://www.npmjs.com/package/github-fetch-starter)

# github-fetch-starter

A github starter fetcher.
This is intended to fetch files (releases on github) that ease starting any project you could think of. You can make your own "starter" releases on behalf of using this tool to easily fetch those releases on your file system and start a project in a *snap*

It is a better way to fetch a repo/release because to `git clone` a repository will fetch the last state of the project which can have a build failure state. Also `git clone` will fetch the `.git` directory which is used for the maintainer of the project and consider useless for the end user.


## Installation
`yarn global add github-fetch-starter`

## Usage

```bash
github-fetch-starter --username 'vdegenne' --app-name 'myapp' node-cli-starter
# or
github-fetch-starter -u 'vdegenne' -n 'myapp' node-cli-starter # for short
```

*This will fetch `vdegenne/myapp` last github release, unpack the archive in a freshly new made `myapp` directory.*

Also you can specify a version,

```bash
github-fetch-starter -u 'vdegenne' -n 'myapp' -v 'v1.1.0' node-cli-starter
```

## Note

It was originally intended to fetch starters to ease starting a project but actually you can use this tool to fetch anything you want. For instance you could fetch react :

```bash
github-fetch-starter -u 'facebook' react
```
