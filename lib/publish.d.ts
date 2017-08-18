export interface PackageInfo {
    name: string;
    version: string;
}
export interface Options {
    commitText?: string;
    branchName?: string;
    tagName?: string;
    extraBranchNames?: string[];
    tagMessageText?: string;
    prepublishCallback?: (tempPackagePath: string) => Promise<boolean>;
    tempDir?: string;
    originalPackageInfo?: PackageInfo;
}
export interface Result {
    conclusion: publish.Conclusions;
}
export default publish;
export declare function publish(packageDir: string, gitRemoteUrl: string, options?: Options): Promise<Result>;
export declare function publish(packageDir: string, gitRemoteUrl: string, commitText: string, tagName: string, tagMessageText: string, tempDir: string, packageInfo: PackageInfo): Promise<boolean>;
export declare namespace publish {
    const PUSHED: 'pushed', SKIPPED: 'skipped', CANCELLED: 'cancelled';
    type Conclusions = typeof PUSHED | typeof SKIPPED | typeof CANCELLED;
}
