import { PlatformCryptoFactory } from "@iota-pico/core/dist/factories/platformCryptoFactory";
import { ArrayHelper } from "@iota-pico/core/dist/helpers/arrayHelper";
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
import { IDataTable } from "../interfaces/IDataTable";
import { IDataTableConfig } from "../interfaces/IDataTableConfig";
import { IDataTableConfigProvider } from "../interfaces/IDataTableConfigProvider";
import { IDataTableIndex } from "../interfaces/IDataTableIndex";
import { IDataTableProgress } from "../interfaces/IDataTableProgress";
import { ISignedDataItem } from "../interfaces/ISignedDataItem";
import { IStorageClient } from "../interfaces/IStorageClient";

/**
 * Represents a table for storing data.
 */
export class DataTable<T extends ISignedDataItem> implements IDataTable<T> {
    /* @internal */
    private static readonly INDEX_TAG: Tag = Tag.fromTrytes(Trytes.fromString("INDEX"));

    /* @internal */
    private readonly _storageClient: IStorageClient;

    /* @internal */
    private readonly _configProvider: IDataTableConfigProvider;

    /* @internal */
    private readonly _tableName: string;

    /* @internal */
    private _config: IDataTableConfig;

    /* @internal */
    private readonly _logger: ILogger;

    /* @internal */
    private readonly _privateKey: string;

    /* @internal */
    private _progressCallback: (progress: IDataTableProgress) => void;

    /**
     * Create a new instance of the DataTable.
     * @param storageClient A storage client to perform storage operations.
     * @param configProvider A provider to get the configuration for the table.
     * @param tableName The name of the table.
     * @param privateKey Private key to add signature to data.
     * @param logger Logger to send storage info to.
     */
    constructor(storageClient: IStorageClient,
                configProvider: IDataTableConfigProvider,
                tableName: string,
                privateKey?: string,
                logger?: ILogger) {
        this._storageClient = storageClient;
        this._configProvider = configProvider;
        this._tableName = tableName;
        this._logger = logger || new NullLogger();
        this._privateKey = privateKey;
    }

    /**
     * Get the index for the table.
     * @returns The table index.
     */
    public async index(): Promise<IDataTableIndex> {
        this._logger.info("===> DataTable::index");

        await this.loadConfig();

        let dataTableIndex: IDataTableIndex;
        if (!StringHelper.isEmpty(this._config.indexBundleHash)) {
            const indexBundleHash = Hash.fromTrytes(Trytes.fromString(this._config.indexBundleHash));

            this.updateProgress(0, 1, "Retrieving Index");
            const index = await this._storageClient.load([indexBundleHash]);
            this.updateProgress(1, 1, "Retrieving Index");

            if (index && index.length > 0) {
                const objectToTrytesConverter = new ObjectTrytesConverter<IDataTableIndex>();

                dataTableIndex = objectToTrytesConverter.from(index[0].data);

                this._logger.info("<=== DataTable::index", dataTableIndex);
            } else {
                this._logger.info("<=== DataTable::index no index available");
            }
        } else {
            this._logger.info("<=== DataTable::index no index hash specified");
        }

        return dataTableIndex;
    }

    /**
     * Clear the index for the table.
     * @param retainHistory Retains the lastIdx value in the index.
     */
    public async clearIndex(retainHistory: boolean): Promise<void> {
        this._logger.info("===> DataTable::clearIndex", retainHistory);

        await this.loadConfig();

        await this.saveIndexBundleHashes([], retainHistory);
    }

    /**
     * Store an item of data in the table.
     * @param data The data to store.
     * @param tag The tag to store with the item.
     * @returns The id of the stored item.
     */
    public async store(data: T, tag: Tag = Tag.EMPTY): Promise<Hash> {
        this._logger.info("===> DataTable::store", data, tag);

        await this.loadConfig();

        if (!StringHelper.isEmpty(this._privateKey)) {
            const platformCrypto = PlatformCryptoFactory.instance().create("default");
            data.sig = undefined;
            data.sig = platformCrypto.sign(this._privateKey, JSON.stringify(data));
        }

        const objectToTrytesConverter = new ObjectTrytesConverter<T>();
        const trytes = objectToTrytesConverter.to(data);

        const dataAddress = Address.fromTrytes(Trytes.fromString(this._config.dataAddress));

        this.updateProgress(0, 1, "Storing Item");
        const storageItem = await this._storageClient.save(dataAddress, trytes, tag);
        this.updateProgress(1, 1, "Storing Item");

        data.bundleHash = storageItem.bundleHash.toTrytes().toString();
        data.transactionHashes = storageItem.transactionHashes.map(th => th.toTrytes().toString());

        const addHash = storageItem.bundleHash.toTrytes().toString();

        const indexBundleHashes = await this.loadIndexBundleHashes();
        indexBundleHashes.push(addHash);

        await this.saveIndexBundleHashes(indexBundleHashes, true);

        this._logger.info("<=== DataTable::store", storageItem.bundleHash);

        return storageItem.bundleHash;
    }

    /**
     * Store multiple items of data in the table.
     * @param data The data to store.
     * @param tags The tag to store with the items.
     * @param clearIndex Clear the index so there is no data.
     * @param retainHistory Retains the lastIdx value in the index.
     * @returns The ids of the stored items.
     */
    public async storeMultiple(data: T[], tags?: Tag[], clearIndex?: boolean, retainHistory?: boolean): Promise<Hash[]> {
        this._logger.info("===> DataTable::storeMultiple", data, tags, clearIndex);

        await this.loadConfig();

        const hashes = [];

        let indexBundleHashes;
        if (!clearIndex) {
            indexBundleHashes = await this.loadIndexBundleHashes();
        }
        indexBundleHashes = indexBundleHashes || [];

        this.updateProgress(0, data.length, "Storing Items");
        for (let i = 0; i < data.length; i++) {
            if (!StringHelper.isEmpty(this._privateKey)) {
                const platformCrypto = PlatformCryptoFactory.instance().create("default");
                data[i].sig = undefined;
                data[i].sig = platformCrypto.sign(this._privateKey, JSON.stringify(data));
            }

            const objectToTrytesConverter = new ObjectTrytesConverter<T>();
            const trytes = objectToTrytesConverter.to(data[i]);

            const dataAddress = Address.fromTrytes(Trytes.fromString(this._config.dataAddress));

            const storageItem = await this._storageClient.save(dataAddress, trytes, tags ? tags[i] : undefined);
            this.updateProgress(i, data.length, "Storing Items");

            data[i].bundleHash = storageItem.bundleHash.toTrytes().toString();
            data[i].transactionHashes = storageItem.transactionHashes.map(th => th.toTrytes().toString());

            const addHash = storageItem.bundleHash.toTrytes().toString();

            indexBundleHashes.push(addHash);

            hashes.push(storageItem.bundleHash);
        }

        await this.saveIndexBundleHashes(indexBundleHashes, retainHistory);

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
    public async update(originalId: Hash, data: T, tag?: Tag): Promise<Hash> {
        this._logger.info("===> DataTable::update", originalId, data, tag);

        await this.loadConfig();

        if (!StringHelper.isEmpty(this._privateKey)) {
            const platformCrypto = PlatformCryptoFactory.instance().create("default");
            data.sig = undefined;
            data.sig = platformCrypto.sign(this._privateKey, JSON.stringify(data));
        }

        const objectToTrytesConverter = new ObjectTrytesConverter<T>();

        const trytes = objectToTrytesConverter.to(data);
        const dataAddress = Address.fromTrytes(Trytes.fromString(this._config.dataAddress));

        this.updateProgress(0, 1, "Updating Item");
        const storageItem = await this._storageClient.save(dataAddress, trytes, tag);
        this.updateProgress(1, 1, "Updating Item");

        data.bundleHash = storageItem.bundleHash.toTrytes().toString();
        data.transactionHashes = storageItem.transactionHashes.map(th => th.toTrytes().toString());

        const indexBundleHashes = await this.loadIndexBundleHashes();
        const removeHash = originalId.toTrytes().toString();
        const addHash = storageItem.bundleHash.toTrytes().toString();

        const idx = indexBundleHashes.indexOf(removeHash);
        if (idx >= 0) {
            indexBundleHashes.splice(idx, 1, addHash);
        } else {
            indexBundleHashes.push(addHash);
        }

        await this.saveIndexBundleHashes(indexBundleHashes, true);

        this._logger.info("<=== DataTable::update", storageItem.bundleHash);

        return storageItem.bundleHash;
    }

    /**
     * Retrieve the data stored in the table.
     * @param id Id of the item to retrieve.
     * @returns The item stored in the table.
     */
    public async retrieve(id: Hash): Promise<T> {
        this._logger.info("===> DataTable::retrieve", id);

        await this.loadConfig();

        let item: T;
        this.updateProgress(0, 1, "Retrieving Item");
        const allStorageItems = await this._storageClient.load([id]);
        this.updateProgress(1, 1, "Retrieving Item");

        if (allStorageItems && allStorageItems.length > 0) {
            const objectToTrytesConverter = new ObjectTrytesConverter<T>();

            item = objectToTrytesConverter.from(allStorageItems[0].data);

            item.bundleHash = allStorageItems[0].bundleHash.toTrytes().toString();
            item.transactionHashes = allStorageItems[0].transactionHashes.map(th => th.toTrytes().toString());
        }

        this._logger.info("<=== DataTable::retrieve", item);

        return item;
    }

    /**
     * Retrieve all the data stored in the table.
     * @param ids Ids of all the items to retrieve, if empty will retrieve all items from index.
     * @returns The items stored in the table.
     */
    public async retrieveMultiple(ids?: Hash[]): Promise<T[]> {
        let loadIds;
        if (ArrayHelper.isTyped(ids, Hash)) {
            loadIds = ids;
        } else {
            const indexBundleHashes = await this.loadIndexBundleHashes();
            if (ArrayHelper.isTyped(indexBundleHashes, String)) {
                loadIds = indexBundleHashes.map(b => Hash.fromTrytes(Trytes.fromString(b)));
            }
        }

        this._logger.info("===> DataTable::retrieveMultiple", loadIds);

        await this.loadConfig();

        const ret: T[] = [];
        if (ArrayHelper.isTyped(loadIds, Hash)) {
            this.updateProgress(0, loadIds.length, "Retrieving Items");
            const allStorageItems = await this._storageClient.load(loadIds);
            this.updateProgress(loadIds.length, loadIds.length, "Retrieving Items");

            const objectToTrytesConverter = new ObjectTrytesConverter<T>();

            for (let i = 0; i < allStorageItems.length; i++) {
                const item = objectToTrytesConverter.from(allStorageItems[i].data);

                item.bundleHash = allStorageItems[i].bundleHash.toTrytes().toString();
                item.transactionHashes = allStorageItems[i].transactionHashes.map(th => th.toTrytes().toString());

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
    public async remove(id: Hash): Promise<void> {
        this._logger.info("===> DataTable::remove", id);

        await this.loadConfig();

        const indexBundleHashes = await this.loadIndexBundleHashes();
        const removeHash = id.toTrytes().toString();

        const idx = indexBundleHashes.indexOf(removeHash);
        if (idx >= 0) {
            indexBundleHashes.splice(idx, 1);

            await this.saveIndexBundleHashes(indexBundleHashes, true);

            this._logger.info("<=== DataTable::remove");
        } else {
            this._logger.info("<=== DataTable::remove nothing to remove");
        }
    }

    /**
     * Remove multiple items of data from the table.
     * @param ids The ids of the items to remove.
     */
    public async removeMultiple(ids: Hash[]): Promise<void> {
        this._logger.info("===> DataTable::removeMultiple", ids);

        await this.loadConfig();

        const indexBundleHashes = await this.loadIndexBundleHashes();
        let removed = false;

        for (let i = 0; i < ids.length; i++) {
            const removeHash = ids[i].toTrytes().toString();

            const idx = indexBundleHashes.indexOf(removeHash);
            if (idx >= 0) {
                indexBundleHashes.splice(idx, 1);

                this._logger.info("<=== DataTable::removeMultiple", ids[i]);

                removed = true;
            } else {
                this._logger.info("<=== DataTable::removeMultiple nothing to remove", ids[i]);
            }
        }

        if (removed) {
            await this.saveIndexBundleHashes(indexBundleHashes, true);
        }
    }

    /**
     * Set the progress callback.
     * @param progressCallback Callback supplied with progress details.
     */
    public setProgressCallback(progressCallback: (progress: IDataTableProgress) => void): void {
        this._progressCallback = progressCallback;
    }

    /* @internal */
    private async loadConfig(): Promise<void> {
        if (ObjectHelper.isEmpty(this._config)) {
            this._logger.info("===> DataTable::getConfig");
            this._config = await this._configProvider.load(this._tableName);
            if (ObjectHelper.isEmpty(this._config) ||
                ObjectHelper.isEmpty(this._config.indexAddress) ||
                ObjectHelper.isEmpty(this._config.dataAddress)) {
                throw new StorageError("Configuration must contain at least the indexAddress and dataAddress");
            }
            this._logger.info("<=== DataTable::getConfig", this._config);
        }
    }

    /* @internal */
    private async saveConfig(): Promise<void> {
        if (!ObjectHelper.isEmpty(this._config)) {
            this._logger.info("===> DataTable::setConfig", this._config);
            await this._configProvider.save(this._tableName, this._config);
            this._logger.info("<=== DataTable::setConfig");
        }
    }

    /* @internal */
    private async loadIndexBundleHashes(): Promise<string[]> {
        const idx = await this.index();

        return idx && idx.bundles ? idx.bundles : [];
    }

    /* @internal */
    private async saveIndexBundleHashes(bundles: string[], retainHistory: boolean): Promise<void> {
        const indexAddress = Address.fromTrytes(Trytes.fromString(this._config.indexAddress));

        const dataTableIndex: IDataTableIndex = {
            ts: Date.now(),
            bundles,
            lastIdx: retainHistory ? this._config.indexBundleHash || Hash.EMPTY.toTrytes().toString() : undefined
        };

        if (!StringHelper.isEmpty(this._privateKey)) {
            const platformCrypto = PlatformCryptoFactory.instance().create("default");
            dataTableIndex.sig = platformCrypto.sign(this._privateKey, JSON.stringify(dataTableIndex));
        }

        const objectToTrytesConverterIndex = new ObjectTrytesConverter<IDataTableIndex>();

        const trytesIndex = objectToTrytesConverterIndex.to(dataTableIndex);

        this.updateProgress(0, 1, "Storing Index");
        const indexStorageItem = await this._storageClient.save(indexAddress, trytesIndex, DataTable.INDEX_TAG);

        this._config.indexBundleHash = indexStorageItem.bundleHash.toTrytes().toString();
        await this.saveConfig();
        this.updateProgress(1, 1, "Storing Index");
    }

    /* @internal */
    private updateProgress(num: number, total: number, status: string): void {
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
