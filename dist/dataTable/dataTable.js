Object.defineProperty(exports, "__esModule", { value: true });
const arrayHelper_1 = require("@iota-pico/core/dist/helpers/arrayHelper");
const objectHelper_1 = require("@iota-pico/core/dist/helpers/objectHelper");
const stringHelper_1 = require("@iota-pico/core/dist/helpers/stringHelper");
const nullLogger_1 = require("@iota-pico/core/dist/loggers/nullLogger");
const objectTrytesConverter_1 = require("@iota-pico/data/dist/converters/objectTrytesConverter");
const address_1 = require("@iota-pico/data/dist/data/address");
const hash_1 = require("@iota-pico/data/dist/data/hash");
const tag_1 = require("@iota-pico/data/dist/data/tag");
const trytes_1 = require("@iota-pico/data/dist/data/trytes");
const storageError_1 = require("../error/storageError");
/**
 * Represents a table for storing data.
 */
class DataTable {
    /**
     * Create a new instance of the DataTable.
     * @param storageClient A storage client to perform storage operations.
     * @param configProvider A provider to get the configuration for the table.
     * @param tableName The name of the table.
     * @param logger Logger to send storage info to.
     */
    constructor(storageClient, configProvider, tableName, logger) {
        this._storageClient = storageClient;
        this._configProvider = configProvider;
        this._tableName = tableName;
        this._logger = logger || new nullLogger_1.NullLogger();
    }
    /**
     * Get the index for the table.
     * @returns The table index.
     */
    async index() {
        this._logger.info("===> DataTable::index");
        await this.loadConfig();
        let dataTableIndex;
        if (!stringHelper_1.StringHelper.isEmpty(this._config.indexBundleHash)) {
            const indexBundleHash = hash_1.Hash.fromTrytes(trytes_1.Trytes.fromString(this._config.indexBundleHash));
            this.updateProgress(0, 1, "Retrieving Index");
            const index = await this._storageClient.load([indexBundleHash]);
            this.updateProgress(1, 1, "Retrieving Index");
            if (index && index.length > 0) {
                const objectToTrytesConverter = new objectTrytesConverter_1.ObjectTrytesConverter();
                dataTableIndex = objectToTrytesConverter.from(index[0].data);
                this._logger.info("<=== DataTable::index", dataTableIndex);
            }
            else {
                this._logger.info("<=== DataTable::index no index available");
            }
        }
        else {
            this._logger.info("<=== DataTable::index no index hash specified");
        }
        return dataTableIndex;
    }
    /**
     * Clear the index for the table.
     */
    async clearIndex() {
        this._logger.info("===> DataTable::clearIndex");
        await this.loadConfig();
        await this.saveIndex([]);
    }
    /**
     * Store an item of data in the table.
     * @param data The data to store.
     * @param tag The tag to store with the item.
     * @returns The id of the stored item.
     */
    async store(data, tag = tag_1.Tag.EMPTY) {
        this._logger.info("===> DataTable::store", data, tag);
        await this.loadConfig();
        const objectToTrytesConverter = new objectTrytesConverter_1.ObjectTrytesConverter();
        const trytes = objectToTrytesConverter.to(data);
        const dataAddress = address_1.Address.fromTrytes(trytes_1.Trytes.fromString(this._config.dataAddress));
        this.updateProgress(0, 1, "Storing Item");
        const storageItem = await this._storageClient.save(dataAddress, trytes, tag);
        this.updateProgress(1, 1, "Storing Item");
        Object.defineProperty(data, "bundleHash", {
            value: storageItem.bundleHash.toTrytes().toString(),
            enumerable: true
        });
        Object.defineProperty(data, "transactionHashes", {
            value: storageItem.transactionHashes.map(th => th.toTrytes().toString()),
            enumerable: true
        });
        const addHash = storageItem.bundleHash.toTrytes().toString();
        let index = await this.index();
        index = index || [];
        index.push(addHash);
        await this.saveIndex(index);
        this._logger.info("<=== DataTable::store", storageItem.bundleHash);
        return storageItem.bundleHash;
    }
    /**
     * Store multiple items of data in the table.
     * @param data The data to store.
     * @param tags The tag to store with the items.
     * @param clearIndex Clear the index so there is no data.
     * @returns The ids of the stored items.
     */
    async storeMultiple(data, tags, clearIndex) {
        this._logger.info("===> DataTable::storeMultiple", data, tags, clearIndex);
        await this.loadConfig();
        const hashes = [];
        let index;
        if (!clearIndex) {
            index = await this.index();
        }
        index = index || [];
        this.updateProgress(0, data.length, "Storing Items");
        for (let i = 0; i < data.length; i++) {
            const objectToTrytesConverter = new objectTrytesConverter_1.ObjectTrytesConverter();
            const trytes = objectToTrytesConverter.to(data[i]);
            const dataAddress = address_1.Address.fromTrytes(trytes_1.Trytes.fromString(this._config.dataAddress));
            const storageItem = await this._storageClient.save(dataAddress, trytes, tags ? tags[i] : undefined);
            this.updateProgress(i, data.length, "Storing Items");
            Object.defineProperty(data[i], "bundleHash", {
                value: storageItem.bundleHash.toTrytes().toString(),
                enumerable: true
            });
            Object.defineProperty(data[i], "transactionHashes", {
                value: storageItem.transactionHashes.map(th => th.toTrytes().toString()),
                enumerable: true
            });
            const addHash = storageItem.bundleHash.toTrytes().toString();
            index.push(addHash);
            hashes.push(storageItem.bundleHash);
        }
        await this.saveIndex(index);
        this._logger.info("<=== DataTable::storeMultiple", hashes);
        return hashes;
    }
    /**
     * Update an item of data in the table.
     * @param originalId The id of the item to update.
     * @param data The data to update.
     * @param tag The tag to store with the item.
     * @returns The id of the updated item.
     */
    async update(originalId, data, tag) {
        this._logger.info("===> DataTable::update", originalId, data, tag);
        await this.loadConfig();
        const objectToTrytesConverter = new objectTrytesConverter_1.ObjectTrytesConverter();
        const trytes = objectToTrytesConverter.to(data);
        const dataAddress = address_1.Address.fromTrytes(trytes_1.Trytes.fromString(this._config.dataAddress));
        this.updateProgress(0, 1, "Updating Item");
        const storageItem = await this._storageClient.save(dataAddress, trytes, tag);
        this.updateProgress(1, 1, "Updating Item");
        Object.defineProperty(data, "bundleHash", {
            value: storageItem.bundleHash.toTrytes().toString(),
            enumerable: true
        });
        Object.defineProperty(data, "transactionHashes", {
            value: storageItem.transactionHashes.map(th => th.toTrytes().toString()),
            enumerable: true
        });
        let index = await this.index();
        index = index || [];
        const removeHash = originalId.toTrytes().toString();
        const addHash = storageItem.bundleHash.toTrytes().toString();
        const idx = index.indexOf(removeHash);
        if (idx >= 0) {
            index.splice(idx, 1, addHash);
        }
        else {
            index.push(addHash);
        }
        await this.saveIndex(index);
        this._logger.info("<=== DataTable::update", storageItem.bundleHash);
        return storageItem.bundleHash;
    }
    /**
     * Retrieve the data stored in the table.
     * @param id Id of the item to retrieve.
     * @returns The item stored in the table.
     */
    async retrieve(id) {
        this._logger.info("===> DataTable::retrieve", id);
        await this.loadConfig();
        let item;
        this.updateProgress(0, 1, "Retrieving Item");
        const allStorageItems = await this._storageClient.load([id]);
        this.updateProgress(1, 1, "Retrieving Item");
        if (allStorageItems && allStorageItems.length > 0) {
            const objectToTrytesConverter = new objectTrytesConverter_1.ObjectTrytesConverter();
            item = objectToTrytesConverter.from(allStorageItems[0].data);
            Object.defineProperty(item, "bundleHash", {
                value: allStorageItems[0].bundleHash.toTrytes().toString(),
                enumerable: true
            });
            Object.defineProperty(item, "transactionHashes", {
                value: allStorageItems[0].transactionHashes.map(th => th.toTrytes().toString()),
                enumerable: true
            });
        }
        this._logger.info("<=== DataTable::retrieve", item);
        return item;
    }
    /**
     * Retrieve all the data stored in the table.
     * @param ids Ids of all the items to retrieve, if empty will retrieve all items from index.
     * @returns The items stored in the table.
     */
    async retrieveMultiple(ids) {
        let loadIds;
        if (arrayHelper_1.ArrayHelper.isTyped(ids, hash_1.Hash)) {
            loadIds = ids;
        }
        else {
            const index = await this.index();
            if (arrayHelper_1.ArrayHelper.isTyped(index, String)) {
                loadIds = index.map(b => hash_1.Hash.fromTrytes(trytes_1.Trytes.fromString(b)));
            }
        }
        this._logger.info("===> DataTable::retrieveMultiple", loadIds);
        await this.loadConfig();
        const ret = [];
        if (arrayHelper_1.ArrayHelper.isTyped(loadIds, hash_1.Hash)) {
            this.updateProgress(0, loadIds.length, "Retrieving Items");
            const allStorageItems = await this._storageClient.load(loadIds);
            this.updateProgress(loadIds.length, loadIds.length, "Retrieving Items");
            const objectToTrytesConverter = new objectTrytesConverter_1.ObjectTrytesConverter();
            for (let i = 0; i < allStorageItems.length; i++) {
                const item = objectToTrytesConverter.from(allStorageItems[i].data);
                Object.defineProperty(item, "bundleHash", {
                    value: allStorageItems[i].bundleHash.toTrytes().toString(),
                    enumerable: true
                });
                Object.defineProperty(item, "transactionHashes", {
                    value: allStorageItems[i].transactionHashes.map(th => th.toTrytes().toString()),
                    enumerable: true
                });
                ret.push(item);
            }
        }
        this._logger.info("<=== DataTable::retrieveMultiple", ret);
        return ret;
    }
    /**
     * Remove an item of data from the table.
     * @param id The id of the item to remove.
     */
    async remove(id) {
        this._logger.info("===> DataTable::remove", id);
        await this.loadConfig();
        let index = await this.index();
        index = index || [];
        const removeHash = id.toTrytes().toString();
        const idx = index.indexOf(removeHash);
        if (idx >= 0) {
            index.splice(idx, 1);
            await this.saveIndex(index);
            this._logger.info("<=== DataTable::remove");
        }
        else {
            this._logger.info("<=== DataTable::remove nothing to remove");
        }
    }
    /**
     * Remove multiple items of data from the table.
     * @param ids The ids of the items to remove.
     */
    async removeMultiple(ids) {
        this._logger.info("===> DataTable::removeMultiple", ids);
        await this.loadConfig();
        let index = await this.index();
        index = index || [];
        let removed = false;
        for (let i = 0; i < ids.length; i++) {
            const removeHash = ids[i].toTrytes().toString();
            const idx = index.indexOf(removeHash);
            if (idx >= 0) {
                index.splice(idx, 1);
                this._logger.info("<=== DataTable::removeMultiple", ids[i]);
                removed = true;
            }
            else {
                this._logger.info("<=== DataTable::removeMultiple nothing to remove", ids[i]);
            }
        }
        if (removed) {
            await this.saveIndex(index);
        }
    }
    /**
     * Set the progress callback.
     * @param progressCallback Callback supplied with progress details.
     */
    setProgressCallback(progressCallback) {
        this._progressCallback = progressCallback;
    }
    /* @internal */
    async loadConfig() {
        if (objectHelper_1.ObjectHelper.isEmpty(this._config)) {
            this._logger.info("===> DataTable::getConfig");
            this._config = await this._configProvider.load(this._tableName);
            if (objectHelper_1.ObjectHelper.isEmpty(this._config) ||
                objectHelper_1.ObjectHelper.isEmpty(this._config.indexAddress) ||
                objectHelper_1.ObjectHelper.isEmpty(this._config.dataAddress)) {
                throw new storageError_1.StorageError("Configuration must contain at least the indexAddress and dataAddress");
            }
            this._logger.info("<=== DataTable::getConfig", this._config);
        }
    }
    /* @internal */
    async saveConfig() {
        if (!objectHelper_1.ObjectHelper.isEmpty(this._config)) {
            this._logger.info("===> DataTable::setConfig", this._config);
            await this._configProvider.save(this._tableName, this._config);
            this._logger.info("<=== DataTable::setConfig");
        }
    }
    /* @internal */
    async saveIndex(index) {
        const indexAddress = address_1.Address.fromTrytes(trytes_1.Trytes.fromString(this._config.indexAddress));
        const objectToTrytesConverterIndex = new objectTrytesConverter_1.ObjectTrytesConverter();
        const trytesIndex = objectToTrytesConverterIndex.to(index);
        this.updateProgress(0, 1, "Storing Index");
        const indexStorageItem = await this._storageClient.save(indexAddress, trytesIndex, DataTable.INDEX_TAG);
        this._config.indexBundleHash = indexStorageItem.bundleHash.toTrytes().toString();
        await this.saveConfig();
        this.updateProgress(1, 1, "Storing Index");
    }
    /* @internal */
    updateProgress(num, total, status) {
        if (this._progressCallback) {
            this._progressCallback({
                numItems: num,
                totalItems: total,
                percent: total > 0 ? Math.ceil((num / total) * 100) : 100,
                status
            });
        }
    }
}
/* @internal */
DataTable.INDEX_TAG = tag_1.Tag.fromTrytes(trytes_1.Trytes.fromString("INDEX"));
exports.DataTable = DataTable;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YVRhYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2RhdGFUYWJsZS9kYXRhVGFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLDBFQUF1RTtBQUN2RSw0RUFBeUU7QUFDekUsNEVBQXlFO0FBRXpFLHdFQUFxRTtBQUNyRSxpR0FBOEY7QUFDOUYsK0RBQTREO0FBQzVELHlEQUFzRDtBQUN0RCx1REFBb0Q7QUFDcEQsNkRBQTBEO0FBQzFELHdEQUFxRDtBQVFyRDs7R0FFRztBQUNIO0lBc0JJOzs7Ozs7T0FNRztJQUNILFlBQVksYUFBNkIsRUFDN0IsY0FBd0MsRUFDeEMsU0FBaUIsRUFDakIsTUFBZ0I7UUFDeEIsSUFBSSxDQUFDLGNBQWMsR0FBRyxhQUFhLENBQUM7UUFDcEMsSUFBSSxDQUFDLGVBQWUsR0FBRyxjQUFjLENBQUM7UUFDdEMsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7UUFDNUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLElBQUksSUFBSSx1QkFBVSxFQUFFLENBQUM7SUFDOUMsQ0FBQztJQUVEOzs7T0FHRztJQUNJLEtBQUssQ0FBQyxLQUFLO1FBQ2QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQztRQUUzQyxNQUFNLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUV4QixJQUFJLGNBQWMsQ0FBQztRQUNuQixJQUFJLENBQUMsMkJBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsRUFBRTtZQUNyRCxNQUFNLGVBQWUsR0FBRyxXQUFJLENBQUMsVUFBVSxDQUFDLGVBQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1lBRXpGLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1lBQzlDLE1BQU0s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