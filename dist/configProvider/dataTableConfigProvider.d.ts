import { ILogger } from "@iota-pico/core/dist/interfaces/ILogger";
import { IConfigProvider } from "../interfaces/IConfigProvider";
import { IDataTableConfig } from "../interfaces/IDataTableConfig";
import { IDataTableConfigProvider } from "../interfaces/IDataTableConfigProvider";
/**
 * Represents a data table config provider which uses and IConfigProvider.
 */
export declare class DataTableConfigProvider implements IDataTableConfigProvider {
    /**
     * Create a new instance of the DataTableConfigProvider.
     * @param configProvider The config provider to use.
     * @param logger Logger to send info to.
     */
    constructor(configProvider: IConfigProvider, logger?: ILogger);
    /**
     * Load the configuration for the data table.
     * @param tableName The table to load the configuration for.
     * @returns The configuration.
     */
    load(tableName: string): Promise<IDataTableConfig>;
    /**
     * Save the configuration for the data table.
     * @param tableName The table to save the configuration for.
     * @param config The configuration to set.
     */
    save(tableName: string, config: IDataTableConfig): Promise<void>;
}
