import { ILogger } from "@iota-pico/core/dist/interfaces/ILogger";
import { IAmazonCredentials } from "../interfaces/IAmazonCredentials";
import { IConfigProvider } from "../interfaces/IConfigProvider";
/**
 * Represents a config provider which uses amazon storage.
 */
export declare class AmazonStorageConfigProvider implements IConfigProvider {
    /**
     * Create a new instance of the AmazonStorageConfigProvider.
     * @param region The name of the region.
     * @param bucketName The name of the bucket object.
     * @param configName The name of the configuration object.
     * @param credentials The key to acccess the amazon api.
     * @param logger Logger to send info to.
     */
    constructor(region: string, bucketName: string, configName: string, credentials?: IAmazonCredentials, logger?: ILogger);
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
