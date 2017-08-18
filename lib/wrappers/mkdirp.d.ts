import * as fs from 'fs';
export interface Options {
    mode?: number;
    fs?: {
        mkdir: typeof fs.mkdir;
        stat: typeof fs.stat;
    };
}
export default function mkdirp(path: string, opts?: number | Options): Promise<string>;
