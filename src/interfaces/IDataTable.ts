import { Hash } from "@iota-pico/data/dist/data/hash";
import { Tag } from "@iota-pico/data/dist/data/tag";
import { IDataTableIndex } from "./IDataTableIndex";
import { IDataTableProgress } from "./IDataTableProgress";
import { ISignedDataItem } from "./ISignedDataItem";

/**
 * Represents a table for storing data.
 * @interface
 */
export interface IDataTable<T extends ISignedDataItem> {
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
     * Set the progress callback.
     * @param progressCallback Callback supplied with progress details.
     */
    setProgressCallback(progressCallback: (progress: IDataTableProgress) => void): void;
}
