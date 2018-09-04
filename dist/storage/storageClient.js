Object.defineProperty(exports, "__esModule", { value: true });
const arrayHelper_1 = require("@iota-pico/core/dist/helpers/arrayHelper");
const objectHelper_1 = require("@iota-pico/core/dist/helpers/objectHelper");
const nullLogger_1 = require("@iota-pico/core/dist/loggers/nullLogger");
const transactionHelper_1 = require("@iota-pico/crypto/dist/helpers/transactionHelper");
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
        return new storageItem_1.StorageItem(hash, data, tag, bundle.transactions[0].attachmentTimestamp.toNumber(), hash, bundle.transactions.map(t => transactionHelper_1.TransactionHelper.hash(t)));
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
                items = this.processBundles(ids, byBundle);
            }
        }
        this._logger.info("<=== StorageClient::load", items);
        return items;
    }
    /* @internal */
    processBundles(ids, byBundle) {
        const itemsByBundle = {};
        const keys = Object.keys(byBundle);
        keys.forEach(bundle => {
            itemsByBundle[bundle] = this.processItem(byBundle[bundle]);
        });
        return ids.map(id => itemsByBundle[id.toTrytes().toString()]);
    }
    /* @internal */
    processItem(bundle) {
        let itemTrytes = "";
        // Sort all the transactions by timestamp
        bundle.sort((a, b) => {
            const x = a.transaction.attachmentTimestamp.toNumber();
            const y = b.transaction.attachmentTimestamp.toNumber();
            return x - y;
        });
        // Now look at the first entry and see how many parts it has
        const numParts = bundle[0].transaction.lastIndex.toNumber();
        // Grab that amount of entries
        // tslint:disable:restrict-plus-operands false positive
        const finalEntries = bundle.slice(0, numParts + 1);
        // Sort each of the bundle transactions by index and create trytes for it
        finalEntries.sort((a, b) => {
            const x = a.transaction.currentIndex.toNumber();
            const y = b.transaction.currentIndex.toNumber();
            return x - y;
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
        return new storageItem_1.StorageItem(finalEntries[0].transaction.bundle, trytes_1.Trytes.fromString(itemTrytes), finalEntries[0].transaction.tag, finalEntries[0].transaction.attachmentTimestamp.toNumber(), finalEntries[0].transaction.bundle, finalEntries.map(th => th.hash));
    }
}
exports.StorageClient = StorageClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmFnZUNsaWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdG9yYWdlL3N0b3JhZ2VDbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBLDBFQUF1RTtBQUN2RSw0RUFBeUU7QUFFekUsd0VBQXFFO0FBQ3JFLHdGQUFxRjtBQUNyRiwrREFBNEQ7QUFDNUQseURBQXNEO0FBQ3RELHVEQUFvRDtBQUVwRCxpRUFBOEQ7QUFDOUQsNkRBQTBEO0FBQzFELHdEQUFxRDtBQUVyRCwrQ0FBNEM7QUFFNUM7O0dBRUc7QUFDSCxNQUFhLGFBQWE7SUFPdEI7Ozs7T0FJRztJQUNILFlBQVksaUJBQXFDLEVBQUUsTUFBZ0I7UUFDL0QsSUFBSSxDQUFDLGtCQUFrQixHQUFHLGlCQUFpQixDQUFDO1FBQzVDLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxJQUFJLElBQUksdUJBQVUsRUFBRSxDQUFDO0lBQzlDLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSSxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQWdCLEVBQUUsSUFBWSxFQUFFLE1BQVcsU0FBRyxDQUFDLEtBQUs7UUFDbEUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsMEJBQTBCLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztRQUVsRSxJQUFJLENBQUMsMkJBQVksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLGlCQUFPLENBQUMsRUFBRTtZQUN4QyxNQUFNLElBQUksMkJBQVksQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO1NBQ2pFO1FBRUQsSUFBSSxDQUFDLDJCQUFZLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxlQUFNLENBQUMsRUFBRTtZQUNwQyxNQUFNLElBQUksMkJBQVksQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO1NBQzdEO1FBRUQsSUFBSSxDQUFDLDJCQUFZLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxTQUFHLENBQUMsRUFBRTtZQUNo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