"use strict";
var pify = require('pify');
var _mkdirp = require('mkdirp');
// wrap real 'mkdirp' using an ES6 export so that it can be stubbed in tests
var mkdirp_p = pify(_mkdirp);
function mkdirp(path, opts) {
    return mkdirp_p(path, opts);
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = mkdirp;
