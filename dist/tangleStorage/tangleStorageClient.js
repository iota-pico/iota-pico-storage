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
const tangleStorageItem_1 = require("./tangleStorageItem");
/**
 * Default implementation of the TangleStorageClient.
 */
class TangleStorageClient {
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
        this._logger.info("===> TangleStorageClient::save", address, data, tag);
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
        this._logger.info("<=== TangleStorageClient::save", hash);
        return hash;
    }
    /**
     * Load the data stored at the address.
     * @param address The address from which to retrieve the item.
     * @param id The id of the item to load.
     * @returns The item stored at the address.
     */
    async load(address, id) {
        this._logger.info("===> TangleStorageClient::load", address, id);
        if (!objectHelper_1.ObjectHelper.isType(address, address_1.Address)) {
            throw new storageError_1.StorageError("The address must be of type Address");
        }
        const ret = await this._transactionClient.findTransactionObjects([id]);
        let finalTrytes = "";
        if (!arrayHelper_1.ArrayHelper.isEmpty(ret)) {
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
        }
        this._logger.info("<=== TangleStorageClient::load", finalTrytes);
        return trytes_1.Trytes.fromString(finalTrytes);
    }
    /**
     * Load all the items with the specified tag.
     * @param address The address from which to retrieve the items.
     * @param tag The tag of the item to load.
     * @returns The items stored at the address with specified tag.
     */
    async loadAllWithTag(address, tag) {
        this._logger.info("===> TangleStorageClient::loadAllWithTag", address, tag);
        if (!objectHelper_1.ObjectHelper.isType(address, address_1.Address)) {
            throw new storageError_1.StorageError("The address must be of type Address");
        }
        if (!objectHelper_1.ObjectHelper.isType(tag, tag_1.Tag)) {
            throw new storageError_1.StorageError("The tag must be of type Tag");
        }
        // Once this PR is integrated https://github.com/iotaledger/iri/pull/340/files
        // we can do this instead of getting all the data and filtering
        //const ret = await this._transactionClient.findTransactionObjects(undefined, [address], [tag]);
        const ret = await this._transactionClient.findTransactionObjects(undefined, [address]);
        const items = [];
        if (!arrayHelper_1.ArrayHelper.isEmpty(ret)) {
            const tagString = tag.toTrytes().toString();
            // Group the transactions by bundle hash
            const byBundle = {};
            ret.forEach(transaction => {
                if (transaction.tag.toString() === tagString) {
                    const bundleHash = transaction.bundle.toTrytes().toString();
                    byBundle[bundleHash] = byBundle[bundleHash] || [];
                    byBundle[bundleHash].push(transaction);
                }
            });
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
                items.push(new tangleStorageItem_1.TangleStorageItem(bundle[0].bundle, trytes_1.Trytes.fromString(itemTrytes)));
            });
        }
        this._logger.info("<=== TangleStorageClient::loadAllWithTag", items);
        return items;
    }
}
exports.TangleStorageClient = TangleStorageClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFuZ2xlU3RvcmFnZUNsaWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YW5nbGVTdG9yYWdlL3RhbmdsZVN0b3JhZ2VDbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBLDBFQUF1RTtBQUN2RSw0RUFBeUU7QUFFekUsd0VBQXFFO0FBRXJFLCtEQUE0RDtBQUM1RCx5REFBc0Q7QUFDdEQsdURBQW9EO0FBQ3BELGlFQUE4RDtBQUM5RCw2REFBMEQ7QUFDMUQsd0RBQXFEO0FBRXJELDJEQUF3RDtBQUV4RDs7R0FFRztBQUNIO0lBT0k7Ozs7T0FJRztJQUNILFlBQVksaUJBQXFDLEVBQUUsTUFBZ0I7UUFDL0QsSUFBSSxDQUFDLGtCQUFrQixHQUFHLGlCQUFpQixDQUFDO1FBQzVDLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxJQUFJLElBQUksdUJBQVUsRUFBRSxDQUFDO0lBQzlDLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSSxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQWdCLEVBQUUsSUFBWSxFQUFFLE1BQVcsU0FBRyxDQUFDLEtBQUs7UUFDbEUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsZ0NBQWdDLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztRQUV4RSxFQUFFLENBQUMsQ0FBQyxDQUFDLDJCQUFZLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxpQkFBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pDLE1BQU0sSUFBSSwyQkFBWSxDQUFDLHFDQUFxQyxDQUFDLENBQUM7UUFDbEUsQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLENBQUMsMkJBQVksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLGVBQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyQyxNQUFNLElBQUksMkJBQVksQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO1FBQzlELENBQUM7UUFFRCxFQUFFLENBQUMsQ0FBQyxD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