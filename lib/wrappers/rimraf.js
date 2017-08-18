"use strict";
var pify = require('pify');
var _rimraf = require('rimraf');
// Define an alternate options interface because the d.ts has a mistake where the last 4 props are marked as
// required properties rather than optional
exports._options = undefined;
// wrap real 'rimraf' using an ES6 export so that it can be stubbed in tests
var rimraf_p = pify(_rimraf);
function rimraf(pattern, options) {
    return rimraf_p(pattern, options);
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = rimraf;
