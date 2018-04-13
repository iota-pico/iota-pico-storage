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
     * Load the data stored with the given bundle hash ids.
     * @param ids The ids of the items to load.
     * @returns The items stored at the hashes.
     */
    public async load(ids: Hash[]): Promise<StorageItem[]> {
        this._logger.info("===> StorageClient::load", ids);

        if (!ArrayHelper.isTyped(ids, Hash)) {
            throw new StorageError("The ids must be an array of type Hash");
        }

        let items: StorageItem[] = [];

        const transactions = await this._transactionClient.findTransactions(ids);

        if (!ArrayHelper.isEmpty(transactions)) {
            const transactionObjects = await this._transactionClient.getTransactionsObjects(transactions);

            if (!ArrayHelper.isEmpty(transactions)) {
                // Group the transactions by bundle hash
                const byBundle: { [id: string]: { hash: Hash; transaction: Transaction }[] } = {};

                transactionObjects.forEach((transaction, idx) => {
                    const bundleHash = transaction.bundle.toTrytes().toString();
                    byBundle[bundleHash] = byBundle[bundleHash] || [];
                    byBundle[bundleHash].push({hash: transactions[idx], transaction});
                });

                items = this.processBundles(byBundle);
            }
        }

        this._logger.info("<=== StorageClient::load", items);

        return items;
    }

    /* @internal */
    private processBundles(byBundle: { [id: string]: { hash: Hash; transaction: Transaction }[] }): StorageItem[] {
        const items: StorageItem[] = [];

        const bundles = Object.keys(byBundle).map((key) => byBundle[key]);

        // Sort the bundles
        const sortedBundles = bundles
            .sort((a, b) => {
                const x = a[0].transaction.attachmentTimestamp.toNumber();
                const y = b[0].transaction.attachmentTimestamp.toNumber();
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            });

        sortedBundles.forEach(bundle => {
            items.push(this.processItem(bundle));
        });

        return items;
    }

    /* @internal */
    private processItem(bundle: { hash: Hash; transaction: Transaction }[]): StorageItem {
        let itemTrytes = "";
        // Sort each of the bundle transactions and create trytes for it

        bundle.sort((a, b) => {
            const x = a.transaction.currentIndex.toNumber();
            const y = b.transaction.currentIndex.toNumber();
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        })
            .forEach(transaction => {
                itemTrytes += transaction.transaction.signatureMessageFragment.toTrytes().toString();
            });

        // Trim any trailing 9s
        itemTrytes = itemTrytes.replace(/9+$/, "");

        // trytes length must be an even number
        if (itemTrytes.length % 2 === 1) {
            itemTrytes += "9";
        }

        return new StorageItem(bundle[0].transaction.bundle,
                               Trytes.fromString(itemTrytes),
                               bundle[0].transaction.tag,
                               bundle[0].transaction.attachmentTimestamp.toNumber(),
                               bundle[0].transaction.bundle, bundle.map(th => th.hash));
    }
}
