import { ILogger } from "@iota-pico/core/dist/interfaces/ILogger";
import { Hash } from "@iota-pico/data/dist/data/hash";
import { Tag } from "@iota-pico/data/dist/data/tag";
import { DataTableIndex } from "../interfaces/dataTableIndex";
import { IDataTable } from "../interfaces/IDataTable";
import { IDataTableConfigProvider } from "../interfaces/IDataTableConfigProvider";
import { IStorageClient } from "../interfaces/IStorageClient";
/**
 * Represents a table for storing data.
 */
export declare class DataTable<T> implements IDataTable<T> {
    /**
     * Create a new instance of the DataTable.
     * @param storageClient A storage client to perform storage operations.
     * @param configProvider A provider to get the configuration for the table.
     * @param tableName The name of the table.
     * @param logger Logger to send storage info to.
     */
    constructor(storageClient: IStorageClient, configProvider: IDataTableConfigProvider, tableName: string, logger?: ILogger);
    /**
     * Get the index for the table.
     * @returns The table index.
     */
    index(): Promise<DataTableIndex>;
    /**
     * Store an item of data in the table.
     * @param data The data to store.
     * @param tag The tag to store with the item.
     * @returns The id of the stored item.
     */
    store(data: T, tag?: Tag): Promise<Hash>;
    /**
     * Update an item of data in the table.
     * @param originalId The id of the item to update.
     * @param data The data to update.
     * @param tag The tag to store with the item.
     * @returns The id of the updated item.
     */
    update(originalId: Hash, data: T, tag?: Tag): Promise<Hash>;
    /**
     * Retrieve all the data stored in the table.
     * @param ids Ids of all the items to retrieve, if empty will retrieve all items from index.
     * @returns The items stored in the table.
     */
    retrieve(ids?: Hash[]): Promise<T[]>;
    /**
     * Remove an item of data from the table.
     * @param id The id of the item to remove.
     */
    remove(id: Hash): Promise<void>;
}
