"use strict";
var fs = require('fs');
var tar = require('tar');
var zlib = require('zlib');
function unpack(tarballPath, destinationPath) {
    var fileStream = fs.createReadStream(tarballPath), gunzipStream = zlib.createUnzip();
    return new Promise(function (resolve, reject) {
        fileStream
            .on('error', reject) // file-level read error
            .pipe(gunzipStream)
            .on('error', reject) // gunzip error
            .pipe(createUntarStream(destinationPath))
            .on('error', reject) // untar error
            .on('close', resolve);
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = unpack;
var MIN_FILE_PERMS = 420, // 110 100 100 | rw- r-- r--
MIN_DIR_PERMS = 493; // 111 101 101 | rwx r-x r-x
function createUntarStream(destinationPath) {
    return tar.Extract({
        type: 'Directory',
        path: destinationPath,
        strip: 1 /* npm pack nests tar images in a /package/ folder */
    }).on('entry', function ensureMinPermissions(entry) {
        entry.mode = entry.mode || entry.props.mode;
        // ensure that permissions always include sensible minimum permissions
        entry.props.mode = entry.mode = entry.mode | (entry.type === 'Directory' ? MIN_DIR_PERMS : MIN_FILE_PERMS);
    });
}
