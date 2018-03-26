import { Tag } from "@iota-pico/data";
import { Hash } from "@iota-pico/data/dist/data/hash";
import { IDataTableIndex } from "./IDataTableIndex";
/**
 * Represents a table for storing data.
 * @interface
 */
export interface IDataTable<T> {
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
     * @param id The of of the item to retrieve.
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
}
