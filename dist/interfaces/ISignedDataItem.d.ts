/**
 * Represents a table item with optional signature.
 * @interface
 */
export interface ISignedDataItem {
    sig?: string;
    bundleHash?: string;
    transactionHashes?: string[];
}
