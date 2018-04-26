Object.defineProperty(exports, "__esModule", { value: true });
const platformCryptoFactory_1 = require("@iota-pico/core/dist/factories/platformCryptoFactory");
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
     * @param publicKey The public key to use for platform crypto functions.
     * @param privateKey The private key to use for platform crypto functions.
     * @param logger Logger to send storage info to.
     */
    constructor(storageClient, configProvider, tableName, publicKey, privateKey, logger) {
        this._storageClient = storageClient;
        this._configProvider = configProvider;
        this._tableName = tableName;
        this._publicKey = publicKey;
        this._privateKey = privateKey;
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
            this.updateProgress(0, 1, "Retrieving Index");
            const index = await this._storageClient.load([indexBundleHash]);
            this.updateProgress(1, 1, "Retrieving Index");
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
        this._logger.info("===> SignedDataTable::store", data, tag);
        const signedItem = this.createSignedItem(data);
        const objectToTrytesConverter = new objectTrytesConverter_1.ObjectTrytesConverter();
        const trytes = objectToTrytesConverter.to(signedItem);
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
        this._logger.info("<=== SignedDataTable::store", storageItem.bundleHash);
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
        this._logger.info("===> SignedDataTable::storeMultiple", data, tags);
        const hashes = [];
        let index;
        if (!clearIndex) {
            index = await this.index();
        }
        index = index || [];
        this.updateProgress(0, data.length, "Storing Items");
        for (let i = 0; i < data.length; i++) {
            const signedItem = this.createSignedItem(data[i]);
            const objectToTrytesConverter = new objectTrytesConverter_1.ObjectTrytesConverter();
            const trytes = objectToTrytesConverter.to(signedItem);
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
        this._logger.info("<=== SignedDataTable::storeMultiple", hashes);
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
        this._logger.info("===> SignedDataTable::update", originalId, data, tag);
        const signedItem = this.createSignedItem(data);
        const objectToTrytesConverter = new objectTrytesConverter_1.ObjectTrytesConverter();
        const trytes = objectToTrytesConverter.to(signedItem);
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
        this._logger.info("<=== SignedDataTable::update", storageItem.bundleHash);
        return storageItem.bundleHash;
    }
    /**
     * Retrieve the data stored in the table.
     * @param id Id of the item to retrieve.
     * @returns The item stored in the table.
     */
    async retrieve(id) {
        this._logger.info("===> SignedDataTable::retrieve", id);
        await this.loadConfig();
        let item;
        this.updateProgress(0, 1, "Retrieving Item");
        const allStorageItems = await this._storageClient.load([id]);
        this.updateProgress(1, 1, "Retrieving Item");
        const objectToTrytesConverter = new objectTrytesConverter_1.ObjectTrytesConverter();
        if (allStorageItems && allStorageItems.length > 0) {
            const signedItem = objectToTrytesConverter.from(allStorageItems[0].data);
            if (!this.validateSignedItem(signedItem, allStorageItems[0].attachmentTimestamp)) {
                this._logger.info("<=== SignedDataTable::retrieve invalid signature", allStorageItems[0]);
            }
            else {
                item = signedItem.data;
            }
        }
        this._logger.info("<=== SignedDataTable::retrieve", item);
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
        this._logger.info("===> SignedDataTable::retrieveMultiple", loadIds);
        await this.loadConfig();
        const ret = [];
        if (arrayHelper_1.ArrayHelper.isTyped(loadIds, hash_1.Hash)) {
            this.updateProgress(0, loadIds.length, "Retrieving Items");
            const allStorageItems = await this._storageClient.load(loadIds);
            this.updateProgress(loadIds.length, loadIds.length, "Retrieving Items");
            const objectToTrytesConverter = new objectTrytesConverter_1.ObjectTrytesConverter();
            allStorageItems.forEach(storageItem => {
                const signedItem = objectToTrytesConverter.from(storageItem.data);
                if (!this.validateSignedItem(signedItem, storageItem.attachmentTimestamp)) {
                    this._logger.info("<=== SignedDataTable::retrieveMultiple invalid signature", storageItem);
                }
                else {
                    ret.push(signedItem.data);
                }
            });
        }
        this._logger.info("<=== SignedDataTable::retrieveMultiple", ret);
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
    /**
     * Remove multiple items of data from the table.
     * @param ids The ids of the items to remove.
     */
    async removeMultiple(ids) {
        this._logger.info("===> SignedDataTable::removeMultiple", ids);
        await this.loadConfig();
        let index = await this.index();
        index = index || [];
        let removed = false;
        for (let i = 0; i < ids.length; i++) {
            const removeHash = ids[i].toTrytes().toString();
            const idx = index.indexOf(removeHash);
            if (idx >= 0) {
                index.splice(idx, 1);
                this._logger.info("<=== SignedDataTable::removeMultiple", ids[i]);
                removed = true;
            }
            else {
                this._logger.info("<=== SignedDataTable::removeMultiple nothing to remove", ids[i]);
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
    createSignedItem(data) {
        const rngService = rngServiceFactory_1.RngServiceFactory.instance().create("default");
        if (objectHelper_1.ObjectHelper.isEmpty(rngService)) {
            throw new storageError_1.StorageError("Unable to create RngService, have you called the PAL.initialize");
        }
        const json = jsonHelper_1.JsonHelper.stringify(data);
        const timestamp = Date.now();
        const platformCrypto = platformCryptoFactory_1.PlatformCryptoFactory.instance().create("default");
        return {
            // tslint:disable:restrict-plus-operands false positive
            signature: platformCrypto.sign(this._privateKey, json + timestamp.toString()),
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
            // tslint:disable:restrict-plus-operands false positive
            attachmentTimestamp - signedItem.timestamp < SignedDataTable.TIMESTAMP_TTL) {
            const json = jsonHelper_1.JsonHelper.stringify(signedItem.data) + signedItem.timestamp.toString();
            const platformCrypto = platformCryptoFactory_1.PlatformCryptoFactory.instance().create("default");
            return platformCrypto.verify(this._publicKey, json, signedItem.signature);
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
        this.updateProgress(0, 1, "Storing Index");
        const indexStorageItem = await this._storageClient.save(indexAddress, trytesIndex, SignedDataTable.INDEX_TAG);
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
SignedDataTable.INDEX_TAG = tag_1.Tag.fromTrytes(trytes_1.Trytes.fromString("INDEX"));
/* @internal */
SignedDataTable.TIMESTAMP_TTL = 1000 * 60;
exports.SignedDataTable = SignedDataTable;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lnbmVkRGF0YVRhYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2RhdGFUYWJsZS9zaWduZWREYXRhVGFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLGdHQUE2RjtBQUM3Rix3RkFBcUY7QUFDckYsMEVBQXVFO0FBQ3ZFLHdFQUFxRTtBQUNyRSw0RUFBeUU7QUFDekUsNEVBQXlFO0FBQ3pFLDRFQUF5RTtBQUV6RSx3RUFBcUU7QUFDckUsaUdBQThGO0FBQzlGLCtEQUE0RDtBQUM1RCx5REFBc0Q7QUFDdEQsdURBQW9EO0FBQ3BELDZEQUEwRDtBQUMxRCx3REFBcUQ7QUFTckQ7O0dBRUc7QUFDSDtJQStCSTs7Ozs7Ozs7T0FRRztJQUNILFlBQVksYUFBNkIsRUFDN0IsY0FBd0MsRUFDeEMsU0FBaUIsRUFDakIsU0FBaUIsRUFDakIsVUFBa0IsRUFDbEIsTUFBZ0I7UUFDeEIsSUFBSSxDQUFDLGNBQWMsR0FBRyxhQUFhLENBQUM7UUFDcEMsSUFBSSxDQUFDLGVBQWUsR0FBRyxjQUFjLENBQUM7UUFDdEMsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7UUFDNUIsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7UUFDNUIsSUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUM7UUFDOUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLElBQUksSUFBSSx1QkFBVSxFQUFFLENBQUM7SUFDOUMsQ0FBQztJQUVEOzs7T0FHRztJQUNJLEtBQUssQ0FBQyxLQUFLO1FBQ2QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsNkJBQTZCLENBQUMsQ0FBQztRQUVqRCxNQUFNLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUV4QixJQUFJLGNBQWMsQ0FBQztRQUNuQixJQUFJLENBQUMsMkJBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsRUFBRTtZQUNyRCxNQUFNLGVB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