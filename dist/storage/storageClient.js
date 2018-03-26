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
     * Load the data stored at the address.
     * @param address The address from which to retrieve the item.
     * @param id The id of the item to load.
     * @returns The item stored at the address.
     */
    async load(address, id) {
        this._logger.info("===> StorageClient::load", address, id);
        if (!objectHelper_1.ObjectHelper.isType(address, address_1.Address)) {
            throw new storageError_1.StorageError("The address must be of type Address");
        }
        const ret = await this._transactionClient.findTransactionObjects([id]);
        let finalTrytes = "";
        let attachmentTimestamp = 0;
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
            attachmentTimestamp = ret[0].attachmentTimestamp.toNumber();
        }
        this._logger.info("<=== StorageClient::load", finalTrytes);
        return new storageItem_1.StorageItem(id, trytes_1.Trytes.fromString(finalTrytes), attachmentTimestamp);
    }
    /**
     * Load all the items with the specified tag.
     * @param address The address from which to retrieve the items.
     * @param tag The tag of the item to load.
     * @returns The items stored at the address with specified tag.
     */
    async loadAllWithTag(address, tag) {
        this._logger.info("===> StorageClient::loadAllWithTag", address, tag);
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
        let items = [];
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
    async loadAllBundles(address, bundles) {
        this._logger.info("===> StorageClient::loadAllBundles", address, bundles);
        if (!objectHelper_1.ObjectHelper.isType(address, address_1.Address)) {
            throw new storageError_1.StorageError("The address must be of type Address");
        }
        if (!arrayHelper_1.ArrayHelper.isTyped(bundles, hash_1.Hash)) {
            throw new storageError_1.StorageError("The bundles must be an array of type Hash");
        }
        const ret = await this._transactionClient.findTransactionObjects(bundles, [address]);
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
        this._logger.info("<=== StorageClient::loadAllBundles", items);
        return items;
    }
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
            items.push(new storageItem_1.StorageItem(bundle[0].bundle, trytes_1.Trytes.fromString(itemTrytes), bundle[0].attachmentTimestamp.toNumber()));
        });
        return items;
    }
}
exports.StorageClient = StorageClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmFnZUNsaWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdG9yYWdlL3N0b3JhZ2VDbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBLDBFQUF1RTtBQUN2RSw0RUFBeUU7QUFFekUsd0VBQXFFO0FBRXJFLCtEQUE0RDtBQUM1RCx5REFBc0Q7QUFDdEQsdURBQW9EO0FBQ3BELGlFQUE4RDtBQUM5RCw2REFBMEQ7QUFDMUQsd0RBQXFEO0FBRXJELCtDQUE0QztBQUU1Qzs7R0FFRztBQUNIO0lBT0k7Ozs7T0FJRztJQUNILFlBQVksaUJBQXFDLEVBQUUsTUFBZ0I7UUFDL0QsSUFBSSxDQUFDLGtCQUFrQixHQUFHLGlCQUFpQixDQUFDO1FBQzVDLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxJQUFJLElBQUksdUJBQVUsRUFBRSxDQUFDO0lBQzlDLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSSxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQWdCLEVBQUUsSUFBWSxFQUFFLE1BQVcsU0FBRyxDQUFDLEtBQUs7UUFDbEUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsMEJBQTBCLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztRQUVsRSxFQUFFLENBQUMsQ0FBQyxDQUFDLDJCQUFZLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxpQkFBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pDLE1BQU0sSUFBSSwyQkFBWSxDQUFDLHFDQUFxQyxDQUFDLENBQUM7UUFDbEUsQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLENBQUMsMkJBQVksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLGVBQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyQyxNQUFNLElBQUksMkJBQVksQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO1FBQzlELENBQUM7UUFFRCxFQUFFLENBQUMsQ0FBQyxDQUFDLDJCQUFZLENBQUMsTUFB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