import type { IExtendedFileStore } from './types';
export declare class NodeFileStore implements IExtendedFileStore {
    write(p: string, data: Uint8Array): Promise<void>;
    read(p: string): Promise<Uint8Array | null>;
    remove(p: string): Promise<void>;
    exists(p: string): Promise<boolean>;
    listTree(root?: string, opts?: {
        followSymlinkDirs?: boolean;
        includeSizes?: boolean;
        pruneDirRegex?: RegExp;
    }): Promise<Array<{
        path: string;
        type: 'file' | 'dir';
        size: number;
    }>>;
    ensureDir(p: string): Promise<void>;
    readdir(p: string): Promise<Array<{
        name: string;
        type: 'file' | 'dir';
    }>>;
    readText(p: string): Promise<string | null>;
    writeText(p: string, text: string): Promise<void>;
    join(...parts: string[]): string;
    dirname(p: string): string;
    fromHere(relative: string, base?: string): string;
}
//# sourceMappingURL=NodeFileStore.d.ts.map