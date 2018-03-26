import { ITransactionClient } from "@iota-pico/business/dist/interfaces/ITransactionClient";
import { ArrayHelper } from "@iota-pico/core/dist/helpers/arrayHelper";
import { ObjectHelper } from "@iota-pico/core/dist/helpers/objectHelper";
import { ILogger } from "@iota-pico/core/dist/interfaces/ILogger";
import { NullLogger } from "@iota-pico/core/dist/loggers/nullLogger";
import { Transaction } from "@iota-pico/data";
import { Address } from "@iota-pico/data/dist/data/address";
import { Hash } from "@iota-pico/data/dist/data/hash";
import { Tag } from "@iota-pico/data/dist/data/tag";
import { Transfer } from "@iota-pico/data/dist/data/transfer";
import { Trytes } from "@iota-pico/data/dist/data/trytes";
import { StorageError } from "../error/storageError";
import { IStorageClient } from "../interfaces/IStorageClient";
import { StorageItem } from "./storageItem";

/**
 * Default implementation of the StorageClient.
 */
export class StorageClient implements IStorageClient {
    /* @internal */
    private readonly _transactionClient: ITransactionClient;

    /* @internal */
    private readonly _logger: ILogger;

    /**
     * Create a new instance of the StorageClient.
     * @param transactionClient A transaction client to perform tangle operations.
     * @param logger Logger to send storage info to.
     */
    constructor(transactionClient: ITransactionClient, logger?: ILogger) {
        this._transactionClient = transactionClient;
        this._logger = logger || new NullLogger();
    }

    /**
     * Save an item of data on the address.
     * @param address The address to store the item.
     * @param data The data to store.
     * @param tag Tag to label the data with.
     * @returns The id of the item saved.
     */
    public async save(address: Address, data: Trytes, tag: Tag = Tag.EMPTY): Promise<Hash> {
        this._logger.info("===> StorageClient::save", address, data, tag);

        if (!ObjectHelper.isType(address, Address)) {
            throw new StorageError("The address must be of type Address");
        }

        if (!ObjectHelper.isType(data, Trytes)) {
            throw new StorageError("The data must be of type Trytes");
        }

        if (!ObjectHelper.isType(tag, Tag)) {
            throw new StorageError("The tag must be of type TryTagtes");
        }

        const transfer = Transfer.fromParams(address, 0, data, tag);

        const bundle = await this._transactionClient.sendTransfer(Hash.EMPTY, 1, 15, [transfer]);

        const hash = bundle.transactions[0].bundle;

        this._logger.info("<=== StorageClient::save", hash);

        return hash;
    }

    /**
     * Load the data stored at the address.
     * @param address The address from which to retrieve the item.
     * @param id The id of the item to load.
     * @returns The item stored at the address.
     */
    public async load(address: Address, id: Hash): Promise<StorageItem> {
        this._logger.info("===> StorageClient::load", address, id);

        if (!ObjectHelper.isType(address, Address)) {
            throw new StorageError("The address must be of type Address");
        }

        const ret = await this._transactionClient.findTransactionObjects([id]);

        let finalTrytes = "";
        let attachmentTimestamp = 0;
        if (!ArrayHelper.isEmpty(ret)) {
            // Sort the transactions in the bundle and combine the trytes
            ret.sort((a, b) => {
                const x = a.currentIndex.toNumber();
                const y = b.currentIndex.toNumber();
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            })
                .forEach(transaction => {
                    finalTrytes += transaction.signatureMessageFragment.toTrytes().toString();
                });

            // Trim any trailing 9s
            finalTrytes = finalTrytes.replace(/9+$/, "");

            // trytes length must be an even number
            if (finalTrytes.length % 2 === 1) {
                finalTrytes += "9";
            }

            attachmentTimestamp = ret[0].attachmentTimestamp.toNumber();
        }

        this._logger.info("<=== StorageClient::load", finalTrytes);

        return new StorageItem(id, Trytes.fromString(finalTrytes), attachmentTimestamp);
    }

    /**
     * Load all the items with the specified tag.
     * @param address The address from which to retrieve the items.
     * @param tag The tag of the item to load.
     * @returns The items stored at the address with specified tag.
     */
    public async loadAllWithTag(address: Address, tag: Tag): Promise<StorageItem[]> {
        this._logger.info("===> StorageClient::loadAllWithTag", address, tag);

        if (!ObjectHelper.isType(address, Address)) {
            throw new StorageError("The address must be of type Address");
        }

        if (!ObjectHelper.isType(tag, Tag)) {
            throw new StorageError("The tag must be of type Tag");
        }

        // Once this PR is integrated https://github.com/iotaledger/iri/pull/340/files
        // we can do this instead of getting all the data and filtering
        //const ret = await this._transactionClient.findTransactionObjects(undefined, [address], [tag]);
        const ret = await this._transactionClient.findTransactionObjects(undefined, [address]);

        let items: StorageItem[] = [];

        if (!ArrayHelper.isEmpty(ret)) {
            const tagString = tag.toTrytes().toString();

            // Group the transactions by bundle hash
            const byBundle: { [id: string]: Transaction[] } = {};

            ret.forEach(transaction => {
                if (transaction.tag.toString() === tagString) {
                    const bundleHash = transaction.bundle.toTrytes().toString();
                    byBundle[bundleHash] = byBundle[bundleHash] || [];
                    byBundle[bundleHash].push(transaction);
                }
            });

            items = this.processBundles(byBundle);
        }

        this._logger.info("<=== StorageClient::loadAllWithTag", items);

        return items;
    }

    /**
     * Load all the specified bundles.
     * @param address The address from which to retrieve the items.
     * @param bundles The hashes of the bundles to load.
     * @returns The items stored at the address with specified bundle hashes.
     */
    public async loadAllBundles(address: Address, bundles: Hash[]): Promise<StorageItem[]> {
        this._logger.info("===> StorageClient::loadAllBundles", address, bundles);

        if (!ObjectHelper.isType(address, Address)) {
            throw new StorageError("The address must be of type Address");
        }

        if (!ArrayHelper.isTyped(bundles, Hash)) {
            throw new StorageError("The bundles must be an array of type Hash");
        }

        const ret = await this._transactionClient.findTransactionObjects(bundles, [address]);

        let items: StorageItem[] = [];

        if (!ArrayHelper.isEmpty(ret)) {
            // Group the transactions by bundle hash
            const byBundle: { [id: string]: Transaction[] } = {};

            ret.forEach(transaction => {
                const bundleHash = transaction.bundle.toTrytes().toString();
                byBundle[bundleHash] = byBundle[bundleHash] || [];
                byBundle[bundleHash].push(transaction);
            });

            items = this.processBundles(byBundle);
        }

        this._logger.info("<=== StorageClient::loadAllBundles", items);

        return items;
    }

    private processBundles(byBundle: { [id: string]: Transaction[] }): StorageItem[] {
        const items: StorageItem[] = [];

        const bundles = Object.keys(byBundle).map((key) => byBundle[key]);

        // Sort the bundles
        const sortedBundles = bundles
            .sort((a, b) => {
                const x = a[0].attachmentTimestamp.toNumber();
                const y = b[0].attachmentTimestamp.toNumber();
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            });

        // Sort each of the bundle transactions and create trytes for it
        sortedBundles.forEach(bundle => {
            let itemTrytes = "";
            bundle.sort((a, b) => {
                const x = a.currentIndex.toNumber();
                const y = b.currentIndex.toNumber();
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            })
                .forEach(transaction => {
                    itemTrytes += transaction.signatureMessageFragment.toTrytes().toString();
                });

            // Trim any trailing 9s
            itemTrytes = itemTrytes.replace(/9+$/, "");

            // trytes length must be an even number
            if (itemTrytes.length % 2 === 1) {
                itemTrytes += "9";
            }

            items.push(new StorageItem(bundle[0].bundle, Trytes.fromString(itemTrytes), bundle[0].attachmentTimestamp.toNumber()));
        });

        return items;
    }
}
