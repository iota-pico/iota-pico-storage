import { ITransactionClient } from "@iota-pico/business/dist/interfaces/ITransactionClient";
import { ILogger } from "@iota-pico/core/dist/interfaces/ILogger";
import { Address } from "@iota-pico/data/dist/data/address";
import { Hash } from "@iota-pico/data/dist/data/hash";
import { Tag } from "@iota-pico/data/dist/data/tag";
import { Trytes } from "@iota-pico/data/dist/data/trytes";
import { ITangleStorageClient } from "../interfaces/ITangleStorageClient";
import { TangleStorageItem } from "./tangleStorageItem";
/**
 * Default implementation of the TangleStorageClient.
 */
export declare class TangleStorageClient implements ITangleStorageClient {
    /**
     * Create a new instance of the StorageClient.
     * @param transactionClient A transaction client to perform tangle operations.
     * @param logger Logger to send storage info to.
     */
    constructor(transactionClient: ITransactionClient, logger?: ILogger);
    /**
     * Save an item of data on the address.
     * @param address The address to store the item.
     * @param data The data to store.
     * @param tag Tag to label the data with.
     * @returns The id of the item saved.
     */
    save(address: Address, data: Trytes, tag?: Tag): Promise<Hash>;
    /**
     * Load the data stored at the address.
     * @param address The address from which to retrieve the item.
     * @param id The id of the item to load.
     * @returns The item stored at the address.
     */
    load(address: Address, id: Hash): Promise<Trytes>;
    /**
     * Load all the items with the specified tag.
     * @param address The address from which to retrieve the items.
     * @param tag The tag of the item to load.
     * @returns The items stored at the address with specified tag.
     */
    loadAllWithTag(address: Address, tag: Tag): Promise<TangleStorageItem[]>;
}
