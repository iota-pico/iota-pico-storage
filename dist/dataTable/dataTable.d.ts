import { ILogger } from "@iota-pico/core/dist/interfaces/ILogger";
import { Address } from "@iota-pico/data/dist/data/address";
import { Hash } from "@iota-pico/data/dist/data/hash";
import { Tag } from "@iota-pico/data/dist/data/tag";
import { ICryptoSigner } from "../interfaces/ICryptoSigner";
import { ICryptoVerifier } from "../interfaces/ICryptoVerifier";
import { IDataTable } from "../interfaces/IDataTable";
import { IDataTableIndex } from "../interfaces/IDataTableIndex";
import { IStorageClient } from "../interfaces/IStorageClient";
/**
 * Represents a table for storing data.
 */
export declare class DataTable<T> implements IDataTable<T> {
    /**
     * Create a new instance of the DataTable.
     * @param storageClient A storage client to perform storage operations.
     * @param indexAddress The address to store the index.
     * @param dataAddress The address to store the data.
     * @param cryptoSigner The object to use for signing.
     * @param cryptoVerifier The object to use for verification.
     * @param logger Logger to send storage info to.
     */
    constructor(storageClient: IStorageClient, indexAddress: Address, dataAddress: Address, cryptoSigner: ICryptoSigner, cryptoVerifier: ICryptoVerifier, logger?: ILogger);
    /**
     * Set the index for the table.
     * @param index The table index.
     * @returns The hash of the newly created bundle.
     */
    setIndex(index: IDataTableIndex): Promise<Hash>;
    /**
     * Get the index for the table.
     * @returns The table index.
     */
    getIndex(): Promise<IDataTableIndex>;
    /**
     * Store an item of data in the table.
     * @param data The data to store.
     * @param tag The tag to store with the item.
     * @returns The id of the stored item.
     */
    store(data: T, tag?: Tag): Promise<Hash>;
    /**
     * Retrieve the data stored in the table.
     * @param id The id of the item to retrieve.
     * @returns The item stored with the id.
     */
    retrieve(id: Hash): Promise<T>;
    /**
     * Retrieve all the data stored in the table.
     * @returns The items stored in the table.
     */
    retrieveAll(): Promise<T[]>;
    /**
     * Remove an item of data from the table.
     * @param id The id of the item to remove.
     */
    remove(id: Hash): Promise<void>;
    private createSignedItem<U>(data);
    private validateSignedObject<U>(signedItem, attachmentTimestamp);
}
