export interface SnapshotDiff {
    type: 'match' | 'mismatch' | 'missing' | 'extra';
    index: number;
    expected?: string;
    actual?: string;
}
export interface SnapshotResult {
    matches: boolean;
    differences: SnapshotDiff[];
    expectedCount: number;
    actualCount: number;
}
export declare function compareEventSequence(expected: string[], actual: string[]): SnapshotResult;
export declare function containsSubsequence(sequence: string[], subsequence: string[]): boolean;
export declare function findMissingEvents(sequence: string[], required: string[]): string[];
export declare function findUnexpectedEvents(sequence: string[], allowed: string[]): string[];
export declare function formatSnapshotDiff(result: SnapshotResult): string;
//# sourceMappingURL=snapshot-compare.d.ts.map