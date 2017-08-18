"use strict";
var child_process_1 = require('child_process');
var path = require('path');
var pify = require('pify');
var fs = require('fs');
var mkdirp_1 = require('./wrappers/mkdirp');
var rimraf_1 = require('./wrappers/rimraf');
var unpack_1 = require('./unpack');
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = publish;
function publish(packageDir, gitRemoteUrl, options, tagName, tagMessageText, tempDir, packageInfo) {
    if (typeof options === 'string') {
        // using the deprecated overload
        return doPublish(packageDir, gitRemoteUrl, {
            commitTextOp: Promise.resolve(options),
            mainTagNameOp: Promise.resolve(tagName),
            tagMessageTextOp: Promise.resolve(tagMessageText),
            prepublishCallback: function (path) { return Promise.resolve(true); },
            tempDir: tempDir,
            originalPackageInfo: packageInfo
        })
            .then(function (result) { return result.conclusion === publish.PUSHED; });
    }
    else {
        // otherwise assume they want the new overload
        return createParams(packageDir, gitRemoteUrl, options)
            .then(function (params) { return doPublish(packageDir, gitRemoteUrl, params); });
    }
}
exports.publish = publish;
var publish;
(function (publish) {
    publish.PUSHED = 'pushed', publish.SKIPPED = 'skipped', publish.CANCELLED = 'cancelled';
})(publish = exports.publish || (exports.publish = {}));
function doPublish(packageDir, gitRemoteUrl, params) {
    var writeFile = pify(fs.writeFile), gitRepoDir = path.join(params.tempDir, 'repo'), packDir = path.join(params.tempDir, 'pack'), commitTextPath = path.join(params.tempDir, 'commitMessage.txt'), tagTextPath = path.join(params.tempDir, 'tagMessage.txt'), cleanupOperations = [];
    // launch setup operations
    var initialCleanDone = rimraf_1.default(params.tempDir, { glob: false });
    var directoryReady = initialCleanDone.then(function () { return mkdirp_1.default(packDir); });
    var commitTextWritten = Promise.all([params.commitTextOp, directoryReady])
        .then(function (_a) {
        var commitText = _a[0];
        return writeFile(commitTextPath, commitText);
    });
    var tagTextWritten = Promise.all([params.tagMessageTextOp, directoryReady])
        .then(function (_a) {
        var tagMessageText = _a[0];
        return writeFile(tagTextPath, tagMessageText);
    });
    // simultaneously ask NPM to pack up the package dir and create a clone of the remote URL
    var tarballCreated = packPackageIntoTarball();
    var doneCloning = cloneRemoteToTempRepo();
    return replaceRepoWithPackContents()
        .then(stageAllRepoChanges)
        .then(function () { return params.prepublishCallback(gitRepoDir); })
        .then(function (shouldContinue) {
        return shouldContinue ? finishReleaseAndReturnResult() : cleanUpAndReturnChanged(publish.CANCELLED);
    });
    function finishReleaseAndReturnResult() {
        return stageAllRepoChanges()
            .then(queryRepoStatus)
            .then(function (hasChanges) { return hasChanges ? commitChanges() : Promise.resolve(); })
            .then(tagLastCommit)
            .then(pushDefaultBranch)
            .then(function () { return cleanUpAndReturnChanged(publish.PUSHED); });
    }
    function cleanUpAndReturnChanged(conclusion) {
        cleanupOperations.push(rimraf_1.default(params.tempDir, { glob: false }));
        return Promise.all(cleanupOperations).then(function () { return ({ conclusion: conclusion }); });
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // LOCAL HELPER FUNCTIONS
    function packPackageIntoTarball() {
        return directoryReady
            .then(function () { return exec("npm pack \"" + packageDir + "\"", { cwd: packDir }); })
            .then(function () {
            // pack succeeded! Schedule a cleanup and return the full path
            // cleanupOperations.push(exec(`npm cache clean ${params.originalPackageInfo.name}@${params.originalPackageInfo.version}`));
            return path.join(packDir, computeTarballName());
        });
    }
    function computeTarballName() {
        var name = params.originalPackageInfo.name;
        if (name[0] === '@') {
            // in generating tarball names, npm special-cases scoped packages.
            name = name.substr(1).replace(/\//g, '-');
        }
        return name + "-" + params.originalPackageInfo.version + ".tgz";
    }
    function cloneRemoteToTempRepo() {
        return initialCleanDone.then(function () {
            child_process_1.execSync("git clone --quiet --depth 1 " + gitRemoteUrl + " \"" + gitRepoDir + "\"", { stdio: 'inherit' });
            if (params.branchName) {
                child_process_1.execSync("git checkout -B " + params.branchName, { cwd: gitRepoDir, stdio: 'inherit' });
            }
        });
    }
    function replaceRepoWithPackContents() {
        // in order to allow for the new release to overwrite the old one (including possibly removing/renaming files),
        // we remove everything that was in the repo before. To do this, use an exclusionary glob.
        var cleanPattern = path.join(gitRepoDir, '!(.git)');
        // tell glob to treat the leading '.' in filename (e.g. Linux/Mac hidden files) as a normal character.
        // this is necessary so that we can successfully delete files that begin with '.'
        var cleanOptions = { glob: { dot: true } };
        var doneCleaning = doneCloning.then(function () { return rimraf_1.default(cleanPattern, cleanOptions); });
        return Promise.all([tarballCreated, doneCleaning])
            .then(function (_a) {
            var tarballPath = _a[0];
            return unpack_1.default(tarballPath, gitRepoDir);
        });
    }
    function stageAllRepoChanges() {
        return exec("git add --all", { cwd: gitRepoDir });
    }
    function queryRepoStatus() {
        return exec("git status --porcelain", { cwd: gitRepoDir })
            .then(function (statusOutput) {
            return statusOutput.trim().length !== 0;
        });
    }
    function commitChanges() {
        var commitCommandText = "git commit --file=\"" + commitTextPath + "\" --allow-empty-message --no-verify";
        return commitTextWritten.then(function () { return exec(commitCommandText, { cwd: gitRepoDir }); });
    }
    function tagLastCommit() {
        return Promise.all([params.mainTagNameOp, tagTextWritten])
            .then(function (_a) {
            var tagName = _a[0];
            return exec("git tag -a --file=\"" + tagTextPath + "\" \"" + tagName + "\"", { cwd: gitRepoDir })
                .then(function () {
                var promises = [];
                (params.extraBranchNames || []).forEach(function (extraBranchName) {
                    promises.push(exec("git branch -f \"" + extraBranchName + "\" \"" + tagName + "\"", { cwd: gitRepoDir }));
                });
                return Promise.all(promises);
            });
        });
    }
    function pushDefaultBranch() {
        var extraBranchNames = (params.extraBranchNames || []).join(' ');
        child_process_1.execSync("git push --follow-tags --force origin HEAD " + extraBranchNames, { cwd: gitRepoDir, stdio: 'inherit' });
    }
}
function readPkg(packageDir) {
    return require('read-pkg')(packageDir);
}
function createParams(packageDir, gitRemoteUrl, options) {
    options = options || {};
    // eagerly copy the provided options because we are about to do asynchronous work
    var requestedCommitText = options.commitText, requestedPrepublishCallback = options.prepublishCallback, requestedTagName = options.tagName, requestedTagMessageText = options.tagMessageText, providedTempDirectory = options.tempDir, requestedBranchName = options.branchName;
    if (options.originalPackageInfo) {
        return Promise.resolve(provideRemainingDefaults(options.originalPackageInfo));
    }
    else {
        return readPkg(packageDir).then(provideRemainingDefaults);
    }
    function provideRemainingDefaults(originalPackageInfo) {
        var prepublishCallback;
        var versionOp;
        if (!requestedPrepublishCallback) {
            // default to no-op transform that just returns true to 'continue'
            prepublishCallback = function (path) { return Promise.resolve(true); };
            versionOp = Promise.resolve(originalPackageInfo.version);
        }
        else {
            var callbackOp_1 = null;
            var setVersionOp_1;
            versionOp = new Promise(function (resolver) {
                setVersionOp_1 = resolver;
            });
            prepublishCallback = function (tempPackagePath) {
                if (callbackOp_1 === null) {
                    callbackOp_1 = requestedPrepublishCallback(tempPackagePath);
                    // now that we have a promise to listen on, observe it and re-read the version from
                    // package.json after it finishes (if the callback promise didn't result in error)
                    var readUpdatedVersionOp = callbackOp_1
                        .then(function () { return readPkg(tempPackagePath); })
                        .then(function (updatedPackageInfo) { return updatedPackageInfo.version; });
                    setVersionOp_1(readUpdatedVersionOp);
                }
                return callbackOp_1;
            };
        }
        var commitTextOp = requestedCommitText ? Promise.resolve(requestedCommitText) :
            versionOp.then(function (version) { return ("release: version " + version); });
        return {
            commitTextOp: commitTextOp,
            tagMessageTextOp: requestedTagMessageText ? Promise.resolve(requestedTagMessageText) : commitTextOp,
            mainTagNameOp: requestedTagName ? Promise.resolve(requestedTagName) : versionOp.then(function (version) { return ("v" + version); }),
            branchName: options.branchName,
            extraBranchNames: options.extraBranchNames,
            prepublishCallback: prepublishCallback,
            tempDir: providedTempDirectory || require('unique-temp-dir')(),
            originalPackageInfo: originalPackageInfo
        };
    }
}
// this has a compatible signature to promisified child_process.exec()
// the difference is that it prints out stdout/stderr if the command fails
function exec(command, options) {
    return new Promise(function (resolve, reject) {
        child_process_1.exec(command, options, function (error, stdout, stderr) {
            if (error) {
                if (stdout) {
                    console.log(stdout);
                }
                if (stderr) {
                    console.error(stderr);
                }
                reject(error);
            }
            else {
                resolve(stdout);
            }
        });
    });
}
