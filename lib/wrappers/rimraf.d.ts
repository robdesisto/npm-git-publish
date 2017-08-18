import * as _rimraf from 'rimraf';
export declare const _options: _rimraf.Options;
export interface Options {
    unlink?: typeof _options.unlink;
    chmod?: typeof _options.chmod;
    stat?: typeof _options.stat;
    lstat?: typeof _options.lstat;
    rmdir?: typeof _options.rmdir;
    readdir?: typeof _options.readdir;
    unlinkSync?: typeof _options.unlinkSync;
    chmodSync?: typeof _options.chmodSync;
    statSync?: typeof _options.statSync;
    lstatSync?: typeof _options.lstatSync;
    rmdirSync?: typeof _options.rmdirSync;
    readdirSync?: typeof _options.readdirSync;
    maxBusyTries?: number;
    emfileWait?: number;
    glob?: typeof _options.glob;
    disableGlob?: boolean;
}
export default function rimraf(pattern: string, options?: Options): Promise<void>;
