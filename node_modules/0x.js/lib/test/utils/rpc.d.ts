export declare class RPC {
    private host;
    private port;
    private id;
    constructor();
    takeSnapshotAsync(): Promise<number>;
    revertSnapshotAsync(snapshotId: number): Promise<boolean>;
    private toPayload(method, params?);
    private sendAsync(payload);
}
