import { RngServiceFactory } from "@iota-pico/core/dist/factories/rngServiceFactory";
import { JsonHelper } from "@iota-pico/core/dist/helpers/jsonHelper";
import { NumberHelper } from "@iota-pico/core/dist/helpers/numberHelper";
import { ObjectHelper } from "@iota-pico/core/dist/helpers/objectHelper";
import { StringHelper } from "@iota-pico/core/dist/helpers/stringHelper";
import { ILogger } from "@iota-pico/core/dist/interfaces/ILogger";
import { NullLogger } from "@iota-pico/core/dist/loggers/nullLogger";
import { ObjectTrytesConverter } from "@iota-pico/data/dist/converters/objectTrytesConverter";
import { Address } from "@iota-pico/data/dist/data/address";
import { Hash } from "@iota-pico/data/dist/data/hash";
import { Tag } from "@iota-pico/data/dist/data/tag";
import { Trytes } from "@iota-pico/data/dist/data/trytes";
import { StorageError } from "../error/storageError";
import { ICryptoSigner } from "../interfaces/ICryptoSigner";
import { ICryptoVerifier } from "../interfaces/ICryptoVerifier";
import { IDataTable } from "../interfaces/IDataTable";
import { IDataTableIndex } from "../interfaces/IDataTableIndex";
import { ISignedItem } from "../interfaces/ISignedItem";
import { IStorageClient } from "../interfaces/IStorageClient";

/**
 * Represents a table for storing data.
 */
export class DataTable<T> implements IDataTable<T> {
    /* @internal */
    private static readonly INDEX_TAG: Tag = Tag.fromTrytes(Trytes.fromString("INDEX"));

    /* @internal */
    private readonly _storageClient: IStorageClient;

    /* @internal */
    private readonly _indexAddress: Address;

    /* @internal */
    private readonly _dataAddress: Address;

    /* @internal */
    private readonly _cryptoSigner: ICryptoSigner;

    /* @internal */
    private readonly _cryptoVerifier: ICryptoVerifier;

    /* @internal */
    private readonly _logger: ILogger;

    /**
     * Create a new instance of the DataTable.
     * @param storageClient A storage client to perform storage operations.
     * @param indexAddress The address to store the index.
     * @param dataAddress The address to store the data.
     * @param cryptoSigner The object to use for signing.
     * @param cryptoVerifier The object to use for verification.
     * @param logger Logger to send storage info to.
     */
    constructor(storageClient: IStorageClient, indexAddress: Address, dataAddress: Address, cryptoSigner: ICryptoSigner, cryptoVerifier: ICryptoVerifier, logger?: ILogger) {
        if (!ObjectHelper.isType(indexAddress, Address)) {
            throw new StorageError("The indexAddress must be of type Address");
        }
        this._storageClient = storageClient;
        this._indexAddress = indexAddress;
        this._dataAddress = dataAddress;
        this._cryptoSigner = cryptoSigner;
        this._cryptoVerifier = cryptoVerifier;
        this._logger = logger || new NullLogger();
    }

    /**
     * Set the index for the table.
     * @param index The table index.
     * @returns The hash of the newly created bundle.
     */
    public async setIndex(index: IDataTableIndex): Promise<Hash> {
        this._logger.info("===> DataTable::setIndex");

        const signedItem = this.createSignedItem(index);

        const objectToTrytesConverter = new ObjectTrytesConverter<ISignedItem<IDataTableIndex>>();

        const trytes = objectToTrytesConverter.to(signedItem);

        const hash = await this._storageClient.save(this._indexAddress, trytes, DataTable.INDEX_TAG);

        this._logger.info("<=== DataTable::setIndex", hash);

        return hash;
    }

    /**
     * Get the index for the table.
     * @returns The table index.
     */
    public async getIndex(): Promise<IDataTableIndex> {
        this._logger.info("===> DataTable::getIndex");

        const allIndexes = await this._storageClient.loadAllWithTag(this._indexAddress, DataTable.INDEX_TAG);

        const objectToTrytesConverter = new ObjectTrytesConverter<ISignedItem<IDataTableIndex>>();

        // Now reverse walk the indexes to find the most recent one that has a valid signature
        let count = allIndexes.length - 1;
        let mostRecent: IDataTableIndex;
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
    public async store(data: T, tag: Tag = Tag.EMPTY): Promise<Hash> {
        this._logger.info("===> DataTable::store");

        const signedItem = this.createSignedItem(data);

        const objectToTrytesConverter = new ObjectTrytesConverter<ISignedItem<T>>();

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
    public async retrieve(id: Hash): Promise<T> {
        this._logger.info("===> DataTable::retrieve");

        const storageItem = await this._storageClient.load(this._dataAddress, id);

        const objectToTrytesConverter = new ObjectTrytesConverter<ISignedItem<T>>();

        const signedItem = objectToTrytesConverter.from(storageItem.data);

        if (!this.validateSignedObject(signedItem, storageItem.attachmentTimestamp)) {
            this._logger.info("<=== DataTable::retrieve invalid signature");
            throw new StorageError("Item signature was not valid", id);
        }

        this._logger.info("<=== DataTable::retrieve", signedItem.data);

        return signedItem.data;
    }

    /**
     * Retrieve all the data stored in the table.
     * @returns The items stored in the table.
     */
    public async retrieveAll(): Promise<T[]> {
        this._logger.info("===> DataTable::retrieveAll");

        const index = await this.getIndex();
        const ret: T[] = [];

        if (index && index.bundles) {
            const allStorageItems = await this._storageClient.loadAllBundles(this._dataAddress, index.bundles.map(b => Hash.fromTrytes(Trytes.fromString(b))));

            const objectToTrytesConverter = new ObjectTrytesConverter<ISignedItem<T>>();

            allStorageItems.forEach(storageItem => {
                const signedItem = objectToTrytesConverter.from(storageItem.data);

                if (!this.validateSignedObject(signedItem, storageItem.attachmentTimestamp)) {
                    this._logger.info("<=== DataTable::retrieveAll invalid signature");
                    throw new StorageError("Item signature was not valid", storageItem.id);
                } else {
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
    public async remove(id: Hash): Promise<void> {
        let index = await this.getIndex();
        index = index || { bundles: [] };
        const strBundleHash = id.toTrytes().toString();

        const idx = index.bundles.indexOf(strBundleHash);
        if (idx >= 0) {
            index.bundles.splice(idx, 1);
            await this.setIndex(index);
        }
    }

    private createSignedItem<U>(data: U): ISignedItem<U> {
        const rngService = RngServiceFactory.instance().create("default");

        if (ObjectHelper.isEmpty(rngService)) {
            throw new StorageError("Unable to create RngService, have you called the PAL.initialize");
        }

        const json = JsonHelper.stringify(data);

        const timestamp = Date.now();

        return {
            signature: this._cryptoSigner.sign(json + timestamp.toString()),
            timestamp,
            data
        };
    }

    private validateSignedObject<U>(signedItem: ISignedItem<U>, attachmentTimestamp: number): boolean {
        if (StringHelper.isString(signedItem.signature) &&
            NumberHelper.isNumber(attachmentTimestamp) &&
            attachmentTimestamp > 0 &&
            NumberHelper.isNumber(signedItem.timestamp) &&
            signedItem.timestamp > 0 &&
            attachmentTimestamp - signedItem.timestamp < 1000 * 60 * 3) {
            const json = JsonHelper.stringify(signedItem.data + signedItem.timestamp.toString());
            return this._cryptoVerifier.verify(json, signedItem.signature);
        } else {
            return false;
        }
    }
}
