Object.defineProperty(exports, "__esModule", { value: true });
const arrayHelper_1 = require("@iota-pico/core/dist/helpers/arrayHelper");
const objectHelper_1 = require("@iota-pico/core/dist/helpers/objectHelper");
const nullLogger_1 = require("@iota-pico/core/dist/loggers/nullLogger");
const address_1 = require("@iota-pico/data/dist/data/address");
const hash_1 = require("@iota-pico/data/dist/data/hash");
const tag_1 = require("@iota-pico/data/dist/data/tag");
const transfer_1 = require("@iota-pico/data/dist/data/transfer");
const trytes_1 = require("@iota-pico/data/dist/data/trytes");
const storageError_1 = require("../error/storageError");
const storageItem_1 = require("./storageItem");
/**
 * Default implementation of the StorageClient.
 */
class StorageClient {
    /**
     * Create a new instance of the StorageClient.
     * @param transactionClient A transaction client to perform tangle operations.
     * @param logger Logger to send storage info to.
     */
    constructor(transactionClient, logger) {
        this._transactionClient = transactionClient;
        this._logger = logger || new nullLogger_1.NullLogger();
    }
    /**
     * Save an item of data on the address.
     * @param address The address to store the item.
     * @param data The data to store.
     * @param tag Tag to label the data with.
     * @returns The id of the item saved.
     */
    async save(address, data, tag = tag_1.Tag.EMPTY) {
        this._logger.info("===> StorageClient::save", address, data, tag);
        if (!objectHelper_1.ObjectHelper.isType(address, address_1.Address)) {
            throw new storageError_1.StorageError("The address must be of type Address");
        }
        if (!objectHelper_1.ObjectHelper.isType(data, trytes_1.Trytes)) {
            throw new storageError_1.StorageError("The data must be of type Trytes");
        }
        if (!objectHelper_1.ObjectHelper.isType(tag, tag_1.Tag)) {
            throw new storageError_1.StorageError("The tag must be of type TryTagtes");
        }
        const transfer = transfer_1.Transfer.fromParams(address, 0, data, tag);
        const bundle = await this._transactionClient.sendTransfer(hash_1.Hash.EMPTY, 1, 15, [transfer]);
        const hash = bundle.transactions[0].bundle;
        this._logger.info("<=== StorageClient::save", hash);
        return hash;
    }
    /**
     * Load the data stored with the given bundle hash ids.
     * @param ids The ids of the items to load.
     * @returns The items stored at the hashes.
     */
    async load(ids) {
        this._logger.info("===> StorageClient::load", ids);
        if (!arrayHelper_1.ArrayHelper.isTyped(ids, hash_1.Hash)) {
            throw new storageError_1.StorageError("The ids must be an array of type Hash");
        }
        let items = [];
        const transactions = await this._transactionClient.findTransactions(ids);
        if (!arrayHelper_1.ArrayHelper.isEmpty(transactions)) {
            const transactionObjects = await this._transactionClient.getTransactionsObjects(transactions);
            if (!arrayHelper_1.ArrayHelper.isEmpty(transactions)) {
                // Group the transactions by bundle hash
                const byBundle = {};
                transactionObjects.forEach((transaction, idx) => {
                    const bundleHash = transaction.bundle.toTrytes().toString();
                    byBundle[bundleHash] = byBundle[bundleHash] || [];
                    byBundle[bundleHash].push({ hash: transactions[idx], transaction });
                });
                items = this.processBundles(byBundle);
            }
        }
        this._logger.info("<=== StorageClient::load", items);
        return items;
    }
    /* @internal */
    processBundles(byBundle) {
        const items = [];
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
    processItem(bundle) {
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
        return new storageItem_1.StorageItem(bundle[0].transaction.bundle, trytes_1.Trytes.fromString(itemTrytes), bundle[0].transaction.tag, bundle[0].transaction.attachmentTimestamp.toNumber(), bundle[0].transaction.bundle, bundle.map(th => th.hash));
    }
}
exports.StorageClient = StorageClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmFnZUNsaWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdG9yYWdlL3N0b3JhZ2VDbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBLDBFQUF1RTtBQUN2RSw0RUFBeUU7QUFFekUsd0VBQXFFO0FBRXJFLCtEQUE0RDtBQUM1RCx5REFBc0Q7QUFDdEQsdURBQW9EO0FBQ3BELGlFQUE4RDtBQUM5RCw2REFBMEQ7QUFDMUQsd0RBQXFEO0FBRXJELCtDQUE0QztBQUU1Qzs7R0FFRztBQUNIO0lBT0k7Ozs7T0FJRztJQUNILFlBQVksaUJBQXFDLEVBQUUsTUFBZ0I7UUFDL0QsSUFBSSxDQUFDLGtCQUFrQixHQUFHLGlCQUFpQixDQUFDO1FBQzVDLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxJQUFJLElBQUksdUJBQVUsRUFBRSxDQUFDO0lBQzlDLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSSxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQWdCLEVBQUUsSUFBWSxFQUFFLE1BQVcsU0FBRyxDQUFDLEtBQUs7UUFDbEUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsMEJBQTBCLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztRQUVsRSxJQUFJLENBQUMsMkJBQVksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLGlCQUFPLENBQUMsRUFBRTtZQUN4QyxNQUFNLElBQUksMkJBQVksQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO1NBQ2pFO1FBRUQsSUFBSSxDQUFDLDJCQUFZLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxlQUFNLENBQUMsRUFBRTtZQUNwQyxNQUFNLElBQUksMkJBQVksQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO1NBQzdEO1FBRUQsSUFBSSxDQUFDLDJCQUFZLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxTQUFHLENBQUMsRUFBRTtZQUNoQyxNQUFNLElBQUksMkJBQVksQ0FBQyxt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