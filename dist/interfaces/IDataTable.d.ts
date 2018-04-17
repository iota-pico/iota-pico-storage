import { Tag } from "@iota-pico/data";
import { Hash } from "@iota-pico/data/dist/data/hash";
import { DataTableIndex } from "./dataTableIndex";
/**
 * Represents a table for storing data.
 * @interface
 */
export interface IDataTable<T> {
    /**
     * Get the index address for the table.
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
