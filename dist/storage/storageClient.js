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
        const ret = await this._transactionClient.findTransactionObjects(ids);
        let items = [];
        if (!arrayHelper_1.ArrayHelper.isEmpty(ret)) {
            // Group the transactions by bundle hash
            const byBundle = {};
            ret.forEach(transaction => {
                const bundleHash = transaction.bundle.toTrytes().toString();
                byBundle[bundleHash] = byBundle[bundleHash] || [];
                byBundle[bundleHash].push(transaction);
            });
            items = this.processBundles(byBundle);
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
            const x = a[0].attachmentTimestamp.toNumber();
            const y = b[0].attachmentTimestamp.toNumber();
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
        return new storageItem_1.StorageItem(bundle[0].bundle, trytes_1.Trytes.fromString(itemTrytes), bundle[0].tag, bundle[0].attachmentTimestamp.toNumber());
    }
}
exports.StorageClient = StorageClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmFnZUNsaWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdG9yYWdlL3N0b3JhZ2VDbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBLDBFQUF1RTtBQUN2RSw0RUFBeUU7QUFFekUsd0VBQXFFO0FBRXJFLCtEQUE0RDtBQUM1RCx5REFBc0Q7QUFDdEQsdURBQW9EO0FBQ3BELGlFQUE4RDtBQUM5RCw2REFBMEQ7QUFDMUQsd0RBQXFEO0FBRXJELCtDQUE0QztBQUU1Qzs7R0FFRztBQUNIO0lBT0k7Ozs7T0FJRztJQUNILFlBQVksaUJBQXFDLEVBQUUsTUFBZ0I7UUFDL0QsSUFBSSxDQUFDLGtCQUFrQixHQUFHLGlCQUFpQixDQUFDO1FBQzVDLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxJQUFJLElBQUksdUJBQVUsRUFBRSxDQUFDO0lBQzlDLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSSxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQWdCLEVBQUUsSUFBWSxFQUFFLE1BQVcsU0FBRyxDQUFDLEtBQUs7UUFDbEUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsMEJBQTBCLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztRQUVsRSxFQUFFLENBQUMsQ0FBQyxDQUFDLDJCQUFZLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxpQkFBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pDLE1BQU0sSUFBSSwyQkFBWSxDQUFDLHFDQUFxQyxDQUFDLENBQUM7UUFDbEUsQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLENBQUMsMkJBQVksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLGVBQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyQyxNQUFNLElBQUksMkJBQVksQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO1FBQzlELENBQUM7UUFFRCxFQUFFLENBQUMsQ0FBQyxDQUFDLDJCQUFZLENBQUMsTUFB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