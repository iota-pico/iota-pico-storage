import { Hash } from "@iota-pico/data";
import { Address } from "@iota-pico/data/dist/data/address";
import { Tag } from "@iota-pico/data/dist/data/tag";
import { Trytes } from "@iota-pico/data/dist/data/trytes";
import { StorageItem } from "../storage/storageItem";

/**
 * Represents a client for performing storage operations.
 * @interface
 */
export interface IStorageClient {
    /**
     * Save an item of data on the address.
     * @param address The address to store the item.
     * @param data The data to store.
     * @param tag Tag to label the data with.
     * @returns The id of the item saved.
     */
    save(address: Address, data: Trytes, tag?: Tag): Promise<Hash>;

    /**
     * Load the data stored with the given bundle hash ids.
     * @param ids The ids of the items to load.
     * @returns The items stored at the hashes.
     */
    load(ids: Hash[]): Promise<StorageItem[]>;
}
