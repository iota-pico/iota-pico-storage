import { ILogger } from "@iota-pico/core/dist/interfaces/ILogger";
import { Hash } from "@iota-pico/data/dist/data/hash";
import { Tag } from "@iota-pico/data/dist/data/tag";
import { IDataTable } from "../interfaces/IDataTable";
import { IDataTableConfigProvider } from "../interfaces/IDataTableConfigProvider";
import { IDataTableIndex } from "../interfaces/IDataTableIndex";
import { IDataTableProgress } from "../interfaces/IDataTableProgress";
import { ISignedDataItem } from "../interfaces/ISignedDataItem";
import { IStorageClient } from "../interfaces/IStorageClient";
/**
 * Represents a table for storing data.
 */
export declare class DataTable<T extends ISignedDataItem> implements IDataTable<T> {
    /**
     * Create a new instance of the DataTable.
     * @param storageClient A storage client to perform storage operations.
     * @param configProvider A provider to get the configuration for the table.
     * @param tableName The name of the table.
     * @param privateKey Private key to add signature to data.
     * @param logger Logger to send storage info to.
     */
    constructor(storageClient: IStorageClient, configProvider: IDataTableConfigProvider, tableName: string, privateKey?: string, logger?: ILogger);
    /**
     * Get the index for the table.
     * @returns The table index.
     */
    index(): Promise<IDataTableIndex>;
    /**
     * Clear the index for the table.
     * @param retainHistory Retains the lastIdx value in the index.
     */
    clearIndex(retainHistory: boolean): Promise<void>;
    /**
     * Store an item of data in the table.
     * @param data The data to store.
     * @param tag The tag to store with the item.
     * @returns The id of the stored item.
     */
    store(data: T, tag?: Tag): Promise<Hash>;
    /**
     * Store multiple items of data in the table.
     * @param data The data to store.
     * @param tags The tag to store with the items.
     * @param clearIndex Clear the index so there is no data.
     * @param retainHistory Retains the lastIdx value in the index.
     * @returns The ids of the stored items.
     */
    storeMultiple(data: T[], tags?: Tag[], clearIndex?: boolean, retainHistory?: boolean): Promise<Hash[]>;
    /**
     * Update an item of data in the table.
     * @param originalId The id of the item to update.
     * @param data The data to update.
     * @param tag The tag to store with the item.
     * @returns The id of the updated item.
     */
    update(originalId: Hash, data: T, tag?: Tag): Promise<Hash>;
    /**
     * Retrieve the data stored in the table.
     * @param id Id of the item to retrieve.
     * @returns The item stored in the table.
     */
    retrieve(id: Hash): Promise<T>;
    /**
     * Retrieve all the data stored in the table.
     * @param ids Ids of all the items to retrieve, if empty will retrieve all items from index.
     * @returns The items stored in the table.
     */
    retrieveMultiple(ids?: Hash[]): Promise<T[]>;
    /**
     * Remove an item of data from the table.
     * @param id The id of the item to remove.
     */
    remove(id: Hash): Promise<void>;
    /**
     * Remove multiple items of data from the table.
     * @param ids The ids of the items to remove.
     */
    removeMultiple(ids: Hash[]): Promise<void>;
    /**
     * Set the progress callback for operations.
     * @param progressCallback Callback supplied with progress details.
     */
    setProgressCallback(progressCallback: (progress: IDataTableProgress) => void): void;
}
