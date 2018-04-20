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
            const index = await this._storageClient.load([indexBundleHash]);
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
        const bundleHash = await this._storageClient.save(dataAddress, trytes, tag);
        const addHash = bundleHash.toTrytes().toString();
        let index = await this.index();
        index = index || [];
        index.push(addHash);
        await this.saveIndex(index);
        this._logger.info("<=== DataTable::store", bundleHash);
        return bundleHash;
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
        const bundleHash = await this._storageClient.save(dataAddress, trytes, tag);
        let index = await this.index();
        index = index || [];
        const removeHash = originalId.toTrytes().toString();
        const addHash = bundleHash.toTrytes().toString();
        const idx = index.indexOf(removeHash);
        if (idx >= 0) {
            index.splice(idx, 1, addHash);
        }
        else {
            index.push(addHash);
        }
        await this.saveIndex(index);
        this._logger.info("<=== DataTable::update", bundleHash);
        return bundleHash;
    }
    /**
     * Retrieve all the data stored in the table.
     * @param ids Ids of all the items to retrieve, if empty will retrieve all items from index.
     * @returns The items stored in the table.
     */
    async retrieve(ids) {
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
        this._logger.info("===> DataTable::retrieve", loadIds);
        await this.loadConfig();
        const ret = [];
        if (arrayHelper_1.ArrayHelper.isTyped(loadIds, hash_1.Hash)) {
            const allStorageItems = await this._storageClient.load(loadIds);
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
        this._logger.info("<=== DataTable::retrieve", ret);
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
        const indexBundleHash = await this._storageClient.save(indexAddress, trytesIndex, DataTable.INDEX_TAG);
        this._config.indexBundleHash = indexBundleHash.toTrytes().toString();
        await this.saveConfig();
    }
}
/* @internal */
DataTable.INDEX_TAG = tag_1.Tag.fromTrytes(trytes_1.Trytes.fromString("INDEX"));
exports.DataTable = DataTable;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YVRhYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2RhdGFUYWJsZS9kYXRhVGFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLDBFQUF1RTtBQUN2RSw0RUFBeUU7QUFDekUsNEVBQXlFO0FBRXpFLHdFQUFxRTtBQUNyRSxpR0FBOEY7QUFDOUYsK0RBQTREO0FBQzVELHlEQUFzRDtBQUN0RCx1REFBb0Q7QUFDcEQsNkRBQTBEO0FBQzFELHdEQUFxRDtBQU9yRDs7R0FFRztBQUNIO0lBbUJJOzs7Ozs7T0FNRztJQUNILFlBQVksYUFBNkIsRUFDN0IsY0FBd0MsRUFDeEMsU0FBaUIsRUFDakIsTUFBZ0I7UUFDeEIsSUFBSSxDQUFDLGNBQWMsR0FBRyxhQUFhLENBQUM7UUFDcEMsSUFBSSxDQUFDLGVBQWUsR0FBRyxjQUFjLENBQUM7UUFDdEMsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7UUFDNUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLElBQUksSUFBSSx1QkFBVSxFQUFFLENBQUM7SUFDOUMsQ0FBQztJQUVEOzs7T0FHRztJQUNJLEtBQUssQ0FBQyxLQUFLO1FBQ2QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQztRQUUzQyxNQUFNLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUV4QixJQUFJLGNBQWMsQ0FBQztRQUNuQixJQUFJLENBQUMsMkJBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsRUFBRTtZQUNyRCxNQUFNLGVBQWUsR0FBRyxXQUFJLENBQUMsVUFBVSxDQUFDLGVBQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1lBQ3pGLE1BQU0sS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FB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