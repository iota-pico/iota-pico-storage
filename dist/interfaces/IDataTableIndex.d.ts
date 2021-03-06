/**
 * Represents a table index for storing data.
 * @interface
 */
export interface IDataTableIndex {
    ts: number;
    bundles: string[];
    lastIdx: string;
    sig?: string;
}
