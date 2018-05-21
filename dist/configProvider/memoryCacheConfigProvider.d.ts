import { IConfigProvider } from "../interfaces/IConfigProvider";
/**
 * Represents a config provider which caches content from another provider.
 */
export declare class MemoryCacheConfigProvider implements IConfigProvider {
    /**
     * Create a new instance of the MemoryCacheConfigProvider.
     * @param configProvider The config provider to cache.
     */
    constructor(configProvider: IConfigProvider);
    /**
     * Load the configuration for the data table.
     * @returns The configuration.
     */
    load<T>(): Promise<T>;
    /**
     * Save the configuration for the data table.
     * @param config The configuration to set.
     */
    save<T>(config: T): Promise<void>;
}
