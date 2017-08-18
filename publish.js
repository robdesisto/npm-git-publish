"use strict";
var publish_1 = require('./lib/publish');
var packageDir = __dirname;
var gitRemoteUrl = 'git@github.com:chaosfinity/npm-git-publish.git';
publish_1.default(packageDir, gitRemoteUrl, { branchName: 'release' })
    .then(function (result) {
    if (result.conclusion === publish_1.default.PUSHED) {
        console.log("Status: PUBLISHED");
    }
    else if (result.conclusion === publish_1.default.SKIPPED) {
        console.log("Status: SKIPPED");
    }
    else if (result.conclusion === publish_1.default.CANCELLED) {
        console.error("Status: CANCELLED");
    }
});
