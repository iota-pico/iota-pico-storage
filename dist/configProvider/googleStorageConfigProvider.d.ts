import { ILogger } from "@iota-pico/core/dist/interfaces/ILogger";
import { IDataTableConfig } from "../interfaces/IDataTableConfig";
import { IDataTableConfigProvider } from "../interfaces/IDataTableConfigProvider";
import { IGoogleServiceAccountKey } from "../interfaces/IGoogleServiceAccountKey";
/**
 * Represents a config provider which uses google storage.
 */
export declare class GoogleStorageConfigProvider implements IDataTableConfigProvider {
    /**
     * Create a new instance of the GoogleStorageConfigProvider.
     * @param bucketName The name of the bucket object.
     * @param configName The name of the configuration object.
     * @param serviceAccountKey The key to acccess the google api.
     * @param logger Logger to send info to.
     */
    constructor(bucketName: string, configName: string, serviceAccountKey: IGoogleServiceAccountKey, logger?: ILogger);
    /**
     * Load the configuration for the data table.
     * @returns The configuration.
     */
    load(): Promise<IDataTableConfig>;
    /**
     * Save the configuration for the data table.
     * @param config The configuration to set.
     */
    save(config: IDataTableConfig): Promise<void>;
    private getToken(scope);
}
