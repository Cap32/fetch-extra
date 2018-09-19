# Contributing

**Working on your first Pull Request?** You can learn how from this _free_ series [How to Contribute to an Open Source Project on GitHub](https://egghead.io/series/how-to-contribute-to-an-open-source-project-on-github)

## Issues

Please provide a minimal, reproducible test-case.

## Pull Requests

Follow the instructions on the Pull Request Template (shown when you open a new PR) and make sure you've done the following:

- [ ] Add & update tests
- [ ] Ensure CI is passing (lint, tests)
- [ ] Update relevant documentation and/or examples

## Setup

This project uses [yarn](https://yarnpkg.com) for development dependency management, and uses [lerna](https://github.com/lerna/lerna) to manage multiple packages.

Ensure you have it installed before continuing.

```sh
$ yarn
```

And then installing all their dependencies in each packages by `bootstrap` script.

```sh
$ yarn bootstrap
```

## Running Tests

```sh
$ yarn test
```

## Building

```sh
$ yarn build
```
