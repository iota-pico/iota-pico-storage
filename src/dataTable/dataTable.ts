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
import { DataTableIndex } from "../interfaces/dataTableIndex";
import { IDataTable } from "../interfaces/IDataTable";
import { IDataTableConfig } from "../interfaces/IDataTableConfig";
import { IDataTableConfigProvider } from "../interfaces/IDataTableConfigProvider";
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
    private readonly _configProvider: IDataTableConfigProvider;

    /* @internal */
    private _config: IDataTableConfig;

    /* @internal */
    private readonly _logger: ILogger;

    /**
     * Create a new instance of the DataTable.
     * @param storageClient A storage client to perform storage operations.
     * @param configProvider A provider to get the configuration for the table.
     * @param logger Logger to send storage info to.
     */
    constructor(storageClient: IStorageClient,
                configProvider: IDataTableConfigProvider,
                logger?: ILogger) {
        this._storageClient = storageClient;
        this._configProvider = configProvider;
        this._logger = logger || new NullLogger();
    }

    /**
     * Get the index for the table.
     * @returns The table index.
     */
    public async index(): Promise<DataTableIndex> {
        this._logger.info("===> DataTable::index");

        await this.loadConfig();

        let dataTableIndex;
        if (!StringHelper.isEmpty(this._config.indexBundleHash)) {
            const indexBundleHash = Hash.fromTrytes(Trytes.fromString(this._config.indexBundleHash));
            const index = await this._storageClient.load([indexBundleHash]);

            if (index && index.length > 0) {
                const objectToTrytesConverter = new ObjectTrytesConverter<DataTableIndex>();

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
     * Store an item of data in the table.
     * @param data The data to store.
     * @param tag The tag to store with the item.
     * @returns The id of the stored item.
     */
    public async store(data: T, tag: Tag = Tag.EMPTY): Promise<Hash> {
        this._logger.info("===> DataTable::store");

        await this.loadConfig();

        const objectToTrytesConverter = new ObjectTrytesConverter<T>();

        const trytes = objectToTrytesConverter.to(data);

        const storageAddress = Address.fromTrytes(Trytes.fromString(this._config.storageAddress));

        const bundleHash = await this._storageClient.save(storageAddress, trytes, tag);

        let index = await this.index();
        index = index || [];
        index.push(bundleHash.toTrytes().toString());

        const objectToTrytesConverterIndex = new ObjectTrytesConverter<DataTableIndex>();

        const trytesIndex = objectToTrytesConverterIndex.to(index);

        const indexBundleHash = await this._storageClient.save(storageAddress, trytesIndex, DataTable.INDEX_TAG);
        this._config.indexBundleHash = indexBundleHash.toTrytes().toString();
        await this.saveConfig();

        this._logger.info("<=== DataTable::store", bundleHash);

        return bundleHash;
    }

    /**
     * Retrieve all the data stored in the table.
     * @param ids Ids of all the items to retrieve, if empty will retrieve all items from index.
     * @returns The items stored in the table.
     */
    public async retrieve(ids?: Hash[]): Promise<T[]> {
        let loadIds;
        if (ArrayHelper.isTyped(ids, Hash)) {
            loadIds = ids;
        } else {
            const index = await this.index();
            if (ArrayHelper.isTyped(index, String)) {
                loadIds = index.map(b => Hash.fromTrytes(Trytes.fromString(b)));
            }
        }

        this._logger.info("===> DataTable::retrieve", loadIds);

        await this.loadConfig();

        const ret: T[] = [];
        if (ArrayHelper.isTyped(loadIds, Hash)) {
            const allStorageItems = await this._storageClient.load(loadIds);

            const objectToTrytesConverter = new ObjectTrytesConverter<T>();

            for (let i = 0; i < allStorageItems.length; i++) {
                const item = objectToTrytesConverter.from(allStorageItems[i].data);
                Object.defineProperty(item, "bundleHash", {
                    value: allStorageItems[i].bundleHash,
                    enumerable: true
                });
                Object.defineProperty(item, "transactionHashes", {
                    value: allStorageItems[i].transactionHashes,
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
    public async remove(id: Hash): Promise<void> {
        this._logger.info("===> DataTable::remove", id);

        await this.loadConfig();

        let index = await this.index();
        index = index || [];
        const removeHash = id.toTrytes().toString();

        const idx = index.indexOf(removeHash);
        if (idx >= 0) {
            index.splice(idx, 1);

            const objectToTrytesConverter = new ObjectTrytesConverter<DataTableIndex>();

            const trytesIndex = objectToTrytesConverter.to(index);

            const storageAddress = Address.fromTrytes(Trytes.fromString(this._config.storageAddress));

            const indexBundleHash = await this._storageClient.save(storageAddress, trytesIndex, DataTable.INDEX_TAG);
            this._config.indexBundleHash = indexBundleHash.toTrytes().toString();
            await this.saveConfig();

            this._logger.info("<=== DataTable::remove");
        } else {
            this._logger.info("<=== DataTable::remove nothing to remove");
        }
    }

    /* @internal */
    private async loadConfig(): Promise<void> {
        if (ObjectHelper.isEmpty(this._config)) {
            this._logger.info("===> DataTable::getConfig");
            this._config = await this._configProvider.load();
            if (ObjectHelper.isEmpty(this._config) || ObjectHelper.isEmpty(this._config.storageAddress)) {
                throw new StorageError("Configuration must contain at least the storageAddress");
            }
            this._logger.info("<=== DataTable::getConfig", this._config);
        }
    }

    /* @internal */
    private async saveConfig(): Promise<void> {
        if (!ObjectHelper.isEmpty(this._config)) {
            this._logger.info("===> DataTable::setConfig", this._config);
            await this._configProvider.save(this._config);
            this._logger.info("<=== DataTable::setConfig");
        }
    }
}
