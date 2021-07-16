# Scotty.js

As you probably noticed, Scotty.js is not active anymore. Working on Scotty.js was fun, but AWS released AWS Amplify in the meantime, and tools such as Scotty.js are no longer needed. Please take a look at the [AWS Amplify Console](https://aws.amazon.com/amplify/hosting/). It's an excellent tool for hosting static websites and single-page applications.

---

Deploy static websites or folders to AWS S3 with a single command

<h1 align="center">
  <img width="400" src="https://raw.githubusercontent.com/stojanovic/scottyjs/master/scotty-header.png" alt="scotty header">
  <br/>
</hr>

[![Build Status](https://travis-ci.org/stojanovic/scottyjs.svg?branch=master)](https://travis-ci.org/stojanovic/scottyjs)
[![npm](https://img.shields.io/npm/v/scottyjs.svg?maxAge=2592000?style=plastic)](https://www.npmjs.com/package/scottyjs)
[![npm](https://img.shields.io/npm/dt/scottyjs.svg?maxAge=2592000?style=plastic)](https://www.npmjs.com/package/scottyjs)
[![npm](https://img.shields.io/npm/l/scottyjs.svg?maxAge=2592000?style=plastic)](https://github.com/stojanovic/scottyjs/blob/master/LICENSE)
[![Join the chat at https://gitter.im/scottyjs/scotty](https://badges.gitter.im/scottyjs/scotty.svg)](https://gitter.im/scottyjs/scotty?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Install

Scotty.js is available on NPM. Install it as a global dependency to be able to use `scotty` command anywhere:

```shell
npm install scottyjs --global
```

## Use

> Beam me up, Scotty

![](scotty-intro.gif)

To deploy a static folder to AWS S3 run:

 ```shell
scotty {options}
 ```

or

```shell
beam-me-up {options}
```

### Available options

- _--help_ or _-h_ - Print this help
- _--version_ or _-v_ - Print the current version
- _--noclipboard_ or _-n_ - Do not copy the URL to clipboard (default: false)
- _--quiet_ or _-q_ - Suppress output when executing commands (default: false)
- _--website_ or _-w_ - Set uploaded folder as a static website (default: false)
- _--spa_ - Set uploaded folder as a single page app (default: false)
- _--source_  or _-s_ - Source of the folder that will be uploaded (default: current folder)
- _--bucket_ or _-b_ - Name of the S3 bucket (default: name of the current folder)
- _--prefix_ or _-p_ - Prefix on the S3 bucket (default: the root of the bucket)
- _--region_ or _-r_ - AWS region where the files will be uploaded, default: saved region if exists or a list to choose one if it is not saved yet
- _--force_ or _-f_ - Update the bucket without asking (default: false, forced region can be overridden with _-r_)
- _--update_ or _-u_ - Update existing bucket (default: false)
- _--delete_ or _-d_ - Delete existing bucket (default: false)
- _--nocdn_ or _-c_ - Disable Cloudfront handling (default: false)
- _--urlonly_ or _-o_ - Only output the resulting URL, CDN or S3 according to options (default: false)
- _--expire_ or _-e_ - delete objects on bucket older than n days (default: no expiration)
- _--profile_ or _-a_ - AWS profile to be used (default: 'default')
- _--empty_ or _-y_ - Empty the bucket (Delete all objects before upload files) (default: false)

### Examples

#### _Create React App_ application

Full tutorial: http://medium.com/@slobodan/single-command-deployment-for-single-page-apps-29941d62ef97

To deploy [CRA](https://github.com/facebookincubator/create-react-app) apps simply run `npm run build` in your project root folder to create build version.

Then deploy build version using following command:

```shell
scotty --spa --source ./build
```

Or, if you want to specify bucket name run:

```shell
scotty --spa --source ./build --bucket some-bucket-name
```

With `--spa` flag, Scotty will set required redirects for your single page app, so your app can use pushState out of the box.

#### _Shared bucket_ application

To deploy multiple apps to a single bucket you can make use of the `--prefix`
option. This comes in handy when your CI system deploys to a staging system
with each branch as a pathname. Eg. the `master` branch should go to bucket
root (`/`), so you do not set the prefix. The `feature/fancy-stuff` branch
should go to the bucket path `feature/fancy-stuff` so just add this as the
prefix. Here comes a command line example:

```shell
# deploy your master branch build to bucket root
scotty --source ./build --bucket some-bucket-name
# deploy your branch build to the branch name on the bucket
scotty --source_ ./build --bucket some-bucket-name --prefix your/branch
```

## Test

We use [Jasmine](https://jasmine.github.io/) for unit and integration tests. Unless there is a very compelling reason to use something different, please continue using Jasmine for tests. The existing tests are in the [spec](spec) folder. Here are some useful command shortcuts:

Run all the tests:

```bash
npm test
```

Run only some tests:

```bash
npm test -- filter=prefix
```

Get detailed hierarchical test name reporting:

```bash
npm test -- full
```
## License

MIT -- see [LICENSE](LICENSE)
