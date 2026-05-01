import { evolve, type ItemStatusChangedEvent, type ItemStatusDocument } from '../../projections/item-status-projection';
export { evolve, type ItemStatusChangedEvent, type ItemStatusDocument };
export declare const itemStatusProjection: {
    name: string;
    canHandle: readonly ["ItemStatusChanged"];
    evolve: typeof evolve;
    getDocumentId: (event: ItemStatusChangedEvent) => string;
};
//# sourceMappingURL=item-status.d.ts.map