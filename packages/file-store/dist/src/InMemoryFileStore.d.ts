import type { IFileStore } from './types';
export declare class InMemoryFileStore implements IFileStore {
    private files;
    private norm;
    write(path: string, data: Uint8Array): Promise<void>;
    read(path: string): Promise<Uint8Array | null>;
    remove(path: string): Promise<void>;
    exists(path: string): Promise<boolean>;
    listTree(root?: string): Promise<Array<{
        path: string;
        type: 'file' | 'dir';
        size: number;
    }>>;
}
//# sourceMappingURL=InMemoryFileStore.d.ts.map