Object.defineProperty(exports, "__esModule", { value: true });
const rngServiceFactory_1 = require("@iota-pico/core/dist/factories/rngServiceFactory");
const arrayHelper_1 = require("@iota-pico/core/dist/helpers/arrayHelper");
const jsonHelper_1 = require("@iota-pico/core/dist/helpers/jsonHelper");
const numberHelper_1 = require("@iota-pico/core/dist/helpers/numberHelper");
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
 * Represents a table for storing data with signing.
 */
class SignedDataTable {
    /**
     * Create a new instance of the DataTable.
     * @param storageClient A storage client to perform storage operations.
     * @param configProvider A provider to get the configuration for the table.
     * @param tableName The name of the table.
     * @param platformCrypto The object to use for platform crypto functions.
     * @param logger Logger to send storage info to.
     */
    constructor(storageClient, configProvider, tableName, platformCrypto, logger) {
        this._storageClient = storageClient;
        this._configProvider = configProvider;
        this._tableName = tableName;
        this._platformCrypto = platformCrypto;
        this._logger = logger || new nullLogger_1.NullLogger();
    }
    /**
     * Get the index for the table.
     * @returns The table index.
     */
    async index() {
        this._logger.info("===> SignedDataTable::index");
        await this.loadConfig();
        let dataTableIndex;
        if (!stringHelper_1.StringHelper.isEmpty(this._config.indexBundleHash)) {
            const indexBundleHash = hash_1.Hash.fromTrytes(trytes_1.Trytes.fromString(this._config.indexBundleHash));
            const index = await this._storageClient.load([indexBundleHash]);
            if (index && index.length > 0) {
                const objectToTrytesConverter = new objectTrytesConverter_1.ObjectTrytesConverter();
                const signedItem = objectToTrytesConverter.from(index[0].data);
                if (!this.validateSignedItem(signedItem, index[0].attachmentTimestamp)) {
                    this._logger.info("<=== SignedDataTable::index invalid signature");
                    throw new storageError_1.StorageError("Item signature was not valid", indexBundleHash);
                }
                else {
                    dataTableIndex = signedItem.data;
                    this._logger.info("<=== SignedDataTable::index", signedItem);
                }
            }
            else {
                this._logger.info("<=== SignedDataTable::index no index available");
            }
        }
        else {
            this._logger.info("<=== SignedDataTable::index no index hash specified");
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
        this._logger.info("===> SignedDataTable::store", data, tag);
        const signedItem = this.createSignedItem(data);
        const objectToTrytesConverter = new objectTrytesConverter_1.ObjectTrytesConverter();
        const trytes = objectToTrytesConverter.to(signedItem);
        const dataAddress = address_1.Address.fromTrytes(trytes_1.Trytes.fromString(this._config.dataAddress));
        const bundleHash = await this._storageClient.save(dataAddress, trytes, tag);
        const addHash = bundleHash.toTrytes().toString();
        let index = await this.index();
        index = index || [];
        index.push(addHash);
        await this.saveIndex(index);
        this._logger.info("<=== SignedDataTable::store", bundleHash);
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
        this._logger.info("===> SignedDataTable::update", originalId, data, tag);
        const signedItem = this.createSignedItem(data);
        const objectToTrytesConverter = new objectTrytesConverter_1.ObjectTrytesConverter();
        const trytes = objectToTrytesConverter.to(signedItem);
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
        this._logger.info("<=== SignedDataTable::update", bundleHash);
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
        this._logger.info("===> SignedDataTable::retrieve", loadIds);
        await this.loadConfig();
        const ret = [];
        if (arrayHelper_1.ArrayHelper.isTyped(loadIds, hash_1.Hash)) {
            const allStorageItems = await this._storageClient.load(loadIds);
            const objectToTrytesConverter = new objectTrytesConverter_1.ObjectTrytesConverter();
            allStorageItems.forEach(storageItem => {
                const signedItem = objectToTrytesConverter.from(storageItem.data);
                if (!this.validateSignedItem(signedItem, storageItem.attachmentTimestamp)) {
                    this._logger.info("<=== SignedDataTable::retrieve invalid signature", storageItem);
                }
                else {
                    ret.push(signedItem.data);
                }
            });
        }
        this._logger.info("<=== SignedDataTable::retrieve", ret);
        return ret;
    }
    /**
     * Remove an item of data from the table.
     * @param id The id of the item to remove.
     */
    async remove(id) {
        this._logger.info("===> SignedDataTable::remove", id);
        let index = await this.index();
        index = index || [];
        const removeHash = id.toTrytes().toString();
        const idx = index.indexOf(removeHash);
        if (idx >= 0) {
            index.splice(idx, 1);
            await this.saveIndex(index);
            this._logger.info("<=== SignedDataTable::remove");
        }
        else {
            this._logger.info("<=== SignedDataTable::remove nothing to remove");
        }
    }
    /* @internal */
    createSignedItem(data) {
        const rngService = rngServiceFactory_1.RngServiceFactory.instance().create("default");
        if (objectHelper_1.ObjectHelper.isEmpty(rngService)) {
            throw new storageError_1.StorageError("Unable to create RngService, have you called the PAL.initialize");
        }
        const json = jsonHelper_1.JsonHelper.stringify(data);
        const timestamp = Date.now();
        return {
            signature: this._platformCrypto.sign(json + timestamp.toString()),
            timestamp,
            data
        };
    }
    /* @internal */
    validateSignedItem(signedItem, attachmentTimestamp) {
        // We only allow a short time to live between the attachmentTimestamp and our data
        // timestamp - this prevents the timestamp and therefore the signature being reused
        if (stringHelper_1.StringHelper.isString(signedItem.signature) &&
            numberHelper_1.NumberHelper.isNumber(attachmentTimestamp) &&
            attachmentTimestamp > 0 &&
            numberHelper_1.NumberHelper.isNumber(signedItem.timestamp) &&
            signedItem.timestamp > 0 &&
            attachmentTimestamp - signedItem.timestamp < SignedDataTable.TIMESTAMP_TTL) {
            const json = jsonHelper_1.JsonHelper.stringify(signedItem.data) + signedItem.timestamp.toString();
            return this._platformCrypto.verify(json, signedItem.signature);
        }
        else {
            return false;
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
        const signedItemIndex = this.createSignedItem(index);
        const objectToTrytesConverterIndex = new objectTrytesConverter_1.ObjectTrytesConverter();
        const trytesIndex = objectToTrytesConverterIndex.to(signedItemIndex);
        const indexBundleHash = await this._storageClient.save(indexAddress, trytesIndex, SignedDataTable.INDEX_TAG);
        this._config.indexBundleHash = indexBundleHash.toTrytes().toString();
        await this.saveConfig();
    }
}
/* @internal */
SignedDataTable.INDEX_TAG = tag_1.Tag.fromTrytes(trytes_1.Trytes.fromString("INDEX"));
/* @internal */
SignedDataTable.TIMESTAMP_TTL = 1000 * 60;
exports.SignedDataTable = SignedDataTable;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lnbmVkRGF0YVRhYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2RhdGFUYWJsZS9zaWduZWREYXRhVGFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLHdGQUFxRjtBQUNyRiwwRUFBdUU7QUFDdkUsd0VBQXFFO0FBQ3JFLDRFQUF5RTtBQUN6RSw0RUFBeUU7QUFDekUsNEVBQXlFO0FBR3pFLHdFQUFxRTtBQUNyRSxpR0FBOEY7QUFDOUYsK0RBQTREO0FBQzVELHlEQUFzRDtBQUN0RCx1REFBb0Q7QUFDcEQsNkRBQTBEO0FBQzFELHdEQUFxRDtBQVFyRDs7R0FFRztBQUNIO0lBeUJJOzs7Ozs7O09BT0c7SUFDSCxZQUFZLGFBQTZCLEVBQzdCLGNBQXdDLEVBQ3hDLFNBQWlCLEVBQ2pCLGNBQStCLEVBQy9CLE1BQWdCO1FBQ3hCLElBQUksQ0FBQyxjQUFjLEdBQUcsYUFBYSxDQUFDO1FBQ3BDLElBQUksQ0FBQyxlQUFlLEdBQUcsY0FBYyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO1FBQzVCLElBQUksQ0FBQyxlQUFlLEdBQUcsY0FBYyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxJQUFJLElBQUksdUJBQVUsRUFBRSxDQUFDO0lBQzlDLENBQUM7SUFFRDs7O09BR0c7SUFDSSxLQUFLLENBQUMsS0FBSztRQUNkLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLDZCQUE2QixDQUFDLENBQUM7UUFFakQsTUFBTSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7UUFFeEIsSUFBSSxjQUFjLENBQUM7UUFDbkIsRUFBRSxDQUFDLENBQUMsQ0FBQywyQkFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0RCxNQUFNLGVBQWUsR0FBRyxXQUFJLENBQUMsVUFBVSxDQUFDLGVBQU0sQ0FBQyxVQUFV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