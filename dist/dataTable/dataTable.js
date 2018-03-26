Object.defineProperty(exports, "__esModule", { value: true });
const rngServiceFactory_1 = require("@iota-pico/core/dist/factories/rngServiceFactory");
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
 * Represents a table for storing data.
 */
class DataTable {
    /**
     * Create a new instance of the DataTable.
     * @param storageClient A storage client to perform storage operations.
     * @param indexAddress The address to store the index.
     * @param dataAddress The address to store the data.
     * @param cryptoSigner The object to use for signing.
     * @param cryptoVerifier The object to use for verification.
     * @param logger Logger to send storage info to.
     */
    constructor(storageClient, indexAddress, dataAddress, cryptoSigner, cryptoVerifier, logger) {
        if (!objectHelper_1.ObjectHelper.isType(indexAddress, address_1.Address)) {
            throw new storageError_1.StorageError("The indexAddress must be of type Address");
        }
        this._storageClient = storageClient;
        this._indexAddress = indexAddress;
        this._dataAddress = dataAddress;
        this._cryptoSigner = cryptoSigner;
        this._cryptoVerifier = cryptoVerifier;
        this._logger = logger || new nullLogger_1.NullLogger();
    }
    /**
     * Set the index for the table.
     * @param index The table index.
     * @returns The hash of the newly created bundle.
     */
    async setIndex(index) {
        this._logger.info("===> DataTable::setIndex");
        const signedItem = this.createSignedItem(index);
        const objectToTrytesConverter = new objectTrytesConverter_1.ObjectTrytesConverter();
        const trytes = objectToTrytesConverter.to(signedItem);
        const hash = await this._storageClient.save(this._indexAddress, trytes, DataTable.INDEX_TAG);
        this._logger.info("<=== DataTable::setIndex", hash);
        return hash;
    }
    /**
     * Get the index for the table.
     * @returns The table index.
     */
    async getIndex() {
        this._logger.info("===> DataTable::getIndex");
        const allIndexes = await this._storageClient.loadAllWithTag(this._indexAddress, DataTable.INDEX_TAG);
        const objectToTrytesConverter = new objectTrytesConverter_1.ObjectTrytesConverter();
        // Now reverse walk the indexes to find the most recent one that has a valid signature
        let count = allIndexes.length - 1;
        let mostRecent;
        while (mostRecent === undefined && count >= 0) {
            const signedItem = objectToTrytesConverter.from(allIndexes[count].data);
            if (this.validateSignedObject(signedItem, allIndexes[count].attachmentTimestamp)) {
                mostRecent = signedItem.data;
            }
            count--;
        }
        this._logger.info("<=== DataTable::getIndex", mostRecent);
        return mostRecent;
    }
    /**
     * Store an item of data in the table.
     * @param data The data to store.
     * @param tag The tag to store with the item.
     * @returns The id of the stored item.
     */
    async store(data, tag = tag_1.Tag.EMPTY) {
        this._logger.info("===> DataTable::store");
        const signedItem = this.createSignedItem(data);
        const objectToTrytesConverter = new objectTrytesConverter_1.ObjectTrytesConverter();
        const trytes = objectToTrytesConverter.to(signedItem);
        const bundleHash = await this._storageClient.save(this._dataAddress, trytes, tag);
        this._logger.info("<=== DataTable::store", bundleHash);
        let index = await this.getIndex();
        index = index || { bundles: [] };
        index.bundles.push(bundleHash.toTrytes().toString());
        await this.setIndex(index);
        return bundleHash;
    }
    /**
     * Retrieve the data stored in the table.
     * @param id The id of the item to retrieve.
     * @returns The item stored with the id.
     */
    async retrieve(id) {
        this._logger.info("===> DataTable::retrieve");
        const storageItem = await this._storageClient.load(this._dataAddress, id);
        const objectToTrytesConverter = new objectTrytesConverter_1.ObjectTrytesConverter();
        const signedItem = objectToTrytesConverter.from(storageItem.data);
        if (!this.validateSignedObject(signedItem, storageItem.attachmentTimestamp)) {
            this._logger.info("<=== DataTable::retrieve invalid signature");
            throw new storageError_1.StorageError("Item signature was not valid", id);
        }
        this._logger.info("<=== DataTable::retrieve", signedItem.data);
        return signedItem.data;
    }
    /**
     * Retrieve all the data stored in the table.
     * @returns The items stored in the table.
     */
    async retrieveAll() {
        this._logger.info("===> DataTable::retrieveAll");
        const index = await this.getIndex();
        const ret = [];
        if (index && index.bundles) {
            const allStorageItems = await this._storageClient.loadAllBundles(this._dataAddress, index.bundles.map(b => hash_1.Hash.fromTrytes(trytes_1.Trytes.fromString(b))));
            const objectToTrytesConverter = new objectTrytesConverter_1.ObjectTrytesConverter();
            allStorageItems.forEach(storageItem => {
                const signedItem = objectToTrytesConverter.from(storageItem.data);
                if (!this.validateSignedObject(signedItem, storageItem.attachmentTimestamp)) {
                    this._logger.info("<=== DataTable::retrieveAll invalid signature");
                    throw new storageError_1.StorageError("Item signature was not valid", storageItem.id);
                }
                else {
                    ret.push(signedItem.data);
                }
            });
        }
        this._logger.info("<=== DataTable::retrieveAll", ret);
        return ret;
    }
    /**
     * Remove an item of data from the table.
     * @param id The id of the item to remove.
     */
    async remove(id) {
        let index = await this.getIndex();
        index = index || { bundles: [] };
        const strBundleHash = id.toTrytes().toString();
        const idx = index.bundles.indexOf(strBundleHash);
        if (idx >= 0) {
            index.bundles.splice(idx, 1);
            await this.setIndex(index);
        }
    }
    createSignedItem(data) {
        const rngService = rngServiceFactory_1.RngServiceFactory.instance().create("default");
        if (objectHelper_1.ObjectHelper.isEmpty(rngService)) {
            throw new storageError_1.StorageError("Unable to create RngService, have you called the PAL.initialize");
        }
        const json = jsonHelper_1.JsonHelper.stringify(data);
        const timestamp = Date.now();
        return {
            signature: this._cryptoSigner.sign(json + timestamp.toString()),
            timestamp,
            data
        };
    }
    validateSignedObject(signedItem, attachmentTimestamp) {
        if (stringHelper_1.StringHelper.isString(signedItem.signature) &&
            numberHelper_1.NumberHelper.isNumber(attachmentTimestamp) &&
            attachmentTimestamp > 0 &&
            numberHelper_1.NumberHelper.isNumber(signedItem.timestamp) &&
            signedItem.timestamp > 0 &&
            attachmentTimestamp - signedItem.timestamp < 1000 * 60 * 3) {
            const json = jsonHelper_1.JsonHelper.stringify(signedItem.data + signedItem.timestamp.toString());
            return this._cryptoVerifier.verify(json, signedItem.signature);
        }
        else {
            return false;
        }
    }
}
/* @internal */
DataTable.INDEX_TAG = tag_1.Tag.fromTrytes(trytes_1.Trytes.fromString("INDEX"));
exports.DataTable = DataTable;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YVRhYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2RhdGFUYWJsZS9kYXRhVGFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLHdGQUFxRjtBQUNyRix3RUFBcUU7QUFDckUsNEVBQXlFO0FBQ3pFLDRFQUF5RTtBQUN6RSw0RUFBeUU7QUFFekUsd0VBQXFFO0FBQ3JFLGlHQUE4RjtBQUM5RiwrREFBNEQ7QUFDNUQseURBQXNEO0FBQ3RELHVEQUFvRDtBQUNwRCw2REFBMEQ7QUFDMUQsd0RBQXFEO0FBUXJEOztHQUVHO0FBQ0g7SUFzQkk7Ozs7Ozs7O09BUUc7SUFDSCxZQUFZLGFBQTZCLEVBQUUsWUFBcUIsRUFBRSxXQUFvQixFQUFFLFlBQTJCLEVBQUUsY0FBK0IsRUFBRSxNQUFnQjtRQUNsSyxFQUFFLENBQUMsQ0FBQyxDQUFDLDJCQUFZLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxpQkFBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlDLE1BQU0sSUFBSSwyQkFBWSxDQUFDLDBDQUEwQyxDQUFDLENBQUM7UUFDdkUsQ0FBQztRQUNELElBQUksQ0FBQyxjQUFjLEdBQUcsYUFBYSxDQUFDO1FBQ3BDLElBQUksQ0FBQyxhQUFhLEdBQUcsWUFBWSxDQUFDO1FBQ2xDLElBQUksQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDO1FBQ2hDLElBQUksQ0FBQyxhQUFhLEdBQUcsWUFBWSxDQUFDO1FBQ2xDLElBQUksQ0FBQyxlQUFlLEdBQUcsY0FBYyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxJQUFJLElBQUksdUJBQVUsRUFBRSxDQUFDO0lBQzlDLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFzQjtRQUN4QyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1FBRTlDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxnQkFB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