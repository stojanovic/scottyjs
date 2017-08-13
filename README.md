# Scotty.js

Deploy static websites or folders to AWS S3 with a single command

<img width="150" src="https://raw.githubusercontent.com/stojanovic/scottyjs/master/scotty.png" alt="scotty">

## Install

Scotty.js is available on NPM. Install it as a global dependency to be able to use `scotty` command anywhere:

```shell
npm install scotty --global
```

## Use

> Beam me up, Scotty

![](intro.gif)

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
- _--quiet_ or _-q_ - Suppress output when executing commands
- _--website_ or _-w_ - Set uploaded folder as a static website, default: false
- _--source_  or _-s_ - Source of the folder that will be uploaded, default: current folder
- _--bucket_ or _-b_ - Name of the S3 bucket (default: name of the current folder)
- _--region_ or _-r_ - AWS region where the files will be uploaded, default: saved region if exists or a list to choose one if it is not saved yet
