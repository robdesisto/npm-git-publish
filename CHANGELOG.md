# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="0.2.8"></a>
## [0.2.8](https://github.com/robdesisto/npm5-git-publish/compare/v0.2.7...v0.2.8) (2018-02-05)


### Bug Fixes

* npm thinks is git repo ([2e4a316](https://github.com/robdesisto/npm5-git-publish/commit/2e4a316))



<a name="0.2.7"></a>
## [0.2.7](https://github.com/robdesisto/npm5-git-publish/compare/v0.2.6...v0.2.7) (2018-01-19)


### Bug Fixes

* remove dev stuff from published package ([cd025d8](https://github.com/robdesisto/npm5-git-publish/commit/cd025d8))



<a name="0.2.6"></a>
## [0.2.6](https://github.com/robdesisto/npm5-git-publish/compare/v0.2.4-beta...v0.2.6) (2018-01-16)


### Bug Fixes

* publishing fix from forked repo to npm ([c173d7c](https://github.com/robdesisto/npm5-git-publish/commit/c173d7c))



# Changelog

## 0.2.4-beta
Bug fix: Using the `--force` option to push a moved branch (version tag) to remote, as
required under certain circumstances.

## 0.2.3-beta
Support extra GIT tags (actually branches, to be better movable) to set for the
publication commit. These names can then be used as alternate version
reference(s) on consumption side.

## 0.2.2-beta
Support type definitions (d.ts files) in published package

## 0.2.1-beta
Fix #19 - package.json prepublish scripts can cause publish to fail

## 0.2.0-beta
* Support for optional parameters / default parameter behaviour
* Support for new promise result (object with `conclusion` property)
* Support for optional prepublish callback

## 0.1.0-beta
* Supports basic scenarios
    * Takes a package directory and Git URL and publishes to it
      in a way that matches `npm publish` or `npm pack`.
    * Supports creating a git tag to mark the release
    * Currently you provide all the information
      (see API docs in README), doesn't decide anything for you.
* Simplest possible implementation for current design
    * All required parameters
