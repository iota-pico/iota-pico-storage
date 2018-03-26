/**
 * Represents an item of data stored with a signature.
 * @interface
 */
export interface ISignedItem<T> {
    data: T;
    timestamp: number;
    signature: string;
}
