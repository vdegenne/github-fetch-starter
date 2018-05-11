[![Build Status](https://travis-ci.org/vdegenne/github-fetch-starter.svg?branch=master)](https://travis-ci.org/vdegenne/github-fetch-starter)
[![npm](https://img.shields.io/npm/v/github-fetch-starter.svg)](https://www.npmjs.com/package/github-fetch-starter)

<h2 align="center"><img src="https://www.purbis.com/images/laundry/lan2.png" height="123"><br>github-fetch-starter</h2>
<p align="center"><strong>A github starter fetcher</strong></p>

This command-line buddy lets you fetch releases on github. You can fetch any releases you want but this application was made specifically for releases representing a starter. A starter is just a github release of a repository containing files that represent an initial state of a given project. This initial state may contain placeholders (of the form `%foo%`) both in filenames or in files' content. So for instance if you have `%app-name%` in your starter, `github-fetch-starter` will prompt for you to specify a value for `app-name` and every placeholder `%app-name%` in the starter will get replaced with this value before made available on your filesystem. This application helps you resolve these placeholders, so not only you can start afresh but also you can make modular starters to help quickly set-up a new project.


## Installation
```bash
sudo npm i -g github-fetch-starter
# or
# sudo yarn global add github-fetch-starter
```

## Usage

```bash
github-fetch-starter --username vdegenne --app-name myapp node-typescript-starter

# or with aliases :
# github-fetch-starter -u vdegenne -n myapp node-typescript-starter

# or prompting for an application name :
# github-fetch-starter -u vdegenne node-typescript-starter
```

*This above command fetches the last release of the repository `vdegenne/node-typescript-starter`, unpacks the archive in a freshly new made directory called `myapp`, and prompts for the placeholders to replace if found any.*


You can also specify a version :

```bash
github-fetch-starter -u vdegenne -v v1.1.0 -n myapp node-typescript-starter
```
