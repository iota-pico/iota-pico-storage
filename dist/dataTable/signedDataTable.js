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
                    const dt = signedItem.data;
                    if (arrayHelper_1.ArrayHelper.isArray(dt)) {
                        dataTableIndex = {
                            bundles: dt,
                            lastIdx: hash_1.Hash.EMPTY.toTrytes().toString()
                        };
                    }
                    else {
                        dataTableIndex = dt;
                    }
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
        this._logger.info("===> SignedDataTable::clearIndex");
        await this.loadConfig();
        await this.saveIndexBundleHashes([]);
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
        const indexBundleHashes = await this.loadIndexBundleHashes();
        indexBundleHashes.push(addHash);
        await this.saveIndexBundleHashes(indexBundleHashes);
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
        let indexBundleHashes;
        if (!clearIndex) {
            indexBundleHashes = await this.loadIndexBundleHashes();
        }
        indexBundleHashes = indexBundleHashes || [];
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
            indexBundleHashes.push(addHash);
            hashes.push(storageItem.bundleHash);
        }
        await this.saveIndexBundleHashes(indexBundleHashes);
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
        const indexBundleHashes = await this.loadIndexBundleHashes();
        const removeHash = originalId.toTrytes().toString();
        const addHash = storageItem.bundleHash.toTrytes().toString();
        const idx = indexBundleHashes.indexOf(removeHash);
        if (idx >= 0) {
            indexBundleHashes.splice(idx, 1, addHash);
        }
        else {
            indexBundleHashes.push(addHash);
        }
        await this.saveIndexBundleHashes(indexBundleHashes);
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
            const indexBundleHashes = await this.loadIndexBundleHashes();
            if (arrayHelper_1.ArrayHelper.isTyped(indexBundleHashes, String)) {
                loadIds = indexBundleHashes.map(b => hash_1.Hash.fromTrytes(trytes_1.Trytes.fromString(b)));
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
        let index = await this.loadIndexBundleHashes();
        index = index || [];
        const removeHash = id.toTrytes().toString();
        const idx = index.indexOf(removeHash);
        if (idx >= 0) {
            index.splice(idx, 1);
            await this.saveIndexBundleHashes(index);
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
        let index = await this.loadIndexBundleHashes();
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
            await this.saveIndexBundleHashes(index);
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
            this._logger.info("===> SignedDataTable::getConfig");
            this._config = await this._configProvider.load(this._tableName);
            if (objectHelper_1.ObjectHelper.isEmpty(this._config) ||
                objectHelper_1.ObjectHelper.isEmpty(this._config.indexAddress) ||
                objectHelper_1.ObjectHelper.isEmpty(this._config.dataAddress)) {
                throw new storageError_1.StorageError("Configuration must contain at least the indexAddress and dataAddress");
            }
            this._logger.info("<=== SignedDataTable::getConfig", this._config);
        }
    }
    /* @internal */
    async saveConfig() {
        if (!objectHelper_1.ObjectHelper.isEmpty(this._config)) {
            this._logger.info("===> SignedDataTable::setConfig", this._config);
            await this._configProvider.save(this._tableName, this._config);
            this._logger.info("<=== SignedDataTable::setConfig");
        }
    }
    /* @internal */
    async loadIndexBundleHashes() {
        const idx = await this.index();
        return idx && idx.bundles ? idx.bundles : [];
    }
    /* @internal */
    async saveIndexBundleHashes(bundles) {
        const indexAddress = address_1.Address.fromTrytes(trytes_1.Trytes.fromString(this._config.indexAddress));
        const dataTableIndex = {
            bundles,
            lastIdx: this._config.indexBundleHash || hash_1.Hash.EMPTY.toTrytes().toString()
        };
        const signedItemIndex = this.createSignedItem(dataTableIndex);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lnbmVkRGF0YVRhYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2RhdGFUYWJsZS9zaWduZWREYXRhVGFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLGdHQUE2RjtBQUM3Rix3RkFBcUY7QUFDckYsMEVBQXVFO0FBQ3ZFLHdFQUFxRTtBQUNyRSw0RUFBeUU7QUFDekUsNEVBQXlFO0FBQ3pFLDRFQUF5RTtBQUV6RSx3RUFBcUU7QUFDckUsaUdBQThGO0FBQzlGLCtEQUE0RDtBQUM1RCx5REFBc0Q7QUFDdEQsdURBQW9EO0FBQ3BELDZEQUEwRDtBQUMxRCx3REFBcUQ7QUFTckQ7O0dBRUc7QUFDSDtJQStCSTs7Ozs7Ozs7T0FRRztJQUNILFlBQVksYUFBNkIsRUFDN0IsY0FBd0MsRUFDeEMsU0FBaUIsRUFDakIsU0FBaUIsRUFDakIsVUFBa0IsRUFDbEIsTUFBZ0I7UUFDeEIsSUFBSSxDQUFDLGNBQWMsR0FBRyxhQUFhLENBQUM7UUFDcEMsSUFBSSxDQUFDLGVBQWUsR0FBRyxjQUFjLENBQUM7UUFDdEMsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7UUFDNUIsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7UUFDNUIsSUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUM7UUFDOUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLElBQUksSUFBSSx1QkFBVSxFQUFFLENBQUM7SUFDOUMsQ0FBQztJQUVEOzs7T0FHRztJQUNJLEtBQUssQ0FBQyxLQUFLO1FBQ2QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsNkJBQTZCLENBQUMsQ0FBQztRQUVqRCxNQUFNLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUV4QixJQUFJLGNBQThCLENBQUM7UUFDbkMsSUFBSSxDQUFDLDJCQUFZLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLEVBQUU7WUFDckQsTUFBTSxl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