import { ITransactionClient } from "@iota-pico/business/dist/interfaces/ITransactionClient";
import { ILogger } from "@iota-pico/core/dist/interfaces/ILogger";
import { Address } from "@iota-pico/data/dist/data/address";
import { Hash } from "@iota-pico/data/dist/data/hash";
import { Tag } from "@iota-pico/data/dist/data/tag";
import { Trytes } from "@iota-pico/data/dist/data/trytes";
import { IStorageClient } from "../interfaces/IStorageClient";
import { StorageItem } from "./storageItem";
/**
 * Default implementation of the StorageClient.
 */
export declare class StorageClient implements IStorageClient {
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
     * Load the data stored with the given bundle hash ids.
     * @param ids The ids of the items to load.
     * @returns The items stored at the hashes.
     */
    load(ids: Hash[]): Promise<StorageItem[]>;
}
