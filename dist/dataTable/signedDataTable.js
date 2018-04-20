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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lnbmVkRGF0YVRhYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2RhdGFUYWJsZS9zaWduZWREYXRhVGFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLHdGQUFxRjtBQUNyRiwwRUFBdUU7QUFDdkUsd0VBQXFFO0FBQ3JFLDRFQUF5RTtBQUN6RSw0RUFBeUU7QUFDekUsNEVBQXlFO0FBR3pFLHdFQUFxRTtBQUNyRSxpR0FBOEY7QUFDOUYsK0RBQTREO0FBQzVELHlEQUFzRDtBQUN0RCx1REFBb0Q7QUFDcEQsNkRBQTBEO0FBQzFELHdEQUFxRDtBQVFyRDs7R0FFRztBQUNIO0lBeUJJOzs7Ozs7O09BT0c7SUFDSCxZQUFZLGFBQTZCLEVBQzdCLGNBQXdDLEVBQ3hDLFNBQWlCLEVBQ2pCLGNBQStCLEVBQy9CLE1BQWdCO1FBQ3hCLElBQUksQ0FBQyxjQUFjLEdBQUcsYUFBYSxDQUFDO1FBQ3BDLElBQUksQ0FBQyxlQUFlLEdBQUcsY0FBYyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO1FBQzVCLElBQUksQ0FBQyxlQUFlLEdBQUcsY0FBYyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxJQUFJLElBQUksdUJBQVUsRUFBRSxDQUFDO0lBQzlDLENBQUM7SUFFRDs7O09BR0c7SUFDSSxLQUFLLENBQUMsS0FBSztRQUNkLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLDZCQUE2QixDQUFDLENBQUM7UUFFakQsTUFBTSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7UUFFeEIsSUFBSSxjQUFjLENBQUM7UUFDbkIsSUFBSSxDQUFDLDJCQUFZLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLEVBQUU7WUFDckQsTUFBTSxlQUFlLEdBQUcsV0FBSSxDQUFDLFVBQVUsQ0FBQyxlQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFP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