import { ObjectHelper } from "@iota-pico/core/dist/helpers/objectHelper";
import { StorageError } from "../error/storageError";
import { IConfigProvider } from "../interfaces/IConfigProvider";

/**
 * Represents a config provider which caches content from another provider.
 */
export class MemoryCacheConfigProvider implements IConfigProvider {
    /* @internal */
    private readonly _configProvider: IConfigProvider;

    /* @internal */
    private _cacheConfig: any;

    /**
     * Create a new instance of the MemoryCacheConfigProvider.
     * @param configProvider The config provider to cache.
     */
    constructor(configProvider: IConfigProvider) {
        if (ObjectHelper.isEmpty(configProvider)) {
            throw new StorageError("The configProvider must not be an empty object");
        }

        this._configProvider = configProvider;
    }

    /**
     * Load the configuration for the data table.
     * @returns The configuration.
     */
    public async load<T>(): Promise<T> {
        if (ObjectHelper.isEmpty(this._cacheConfig)) {
            this._cacheConfig = await this._configProvider.load();
        }

        return this._cacheConfig;
    }

    /**
     * Save the configuration for the data table.
     * @param config The configuration to set.
     */
    public async save<T>(config: T): Promise<void> {
        this._cacheConfig = config;
        await this._cacheConfig.save(config);
    }
}
