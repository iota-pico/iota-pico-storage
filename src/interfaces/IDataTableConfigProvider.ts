import { IDataTableConfig } from "./IDataTableConfig";

/**
 * Represents a class that can get/set data table configuration.
 * @interface
 */
export interface IDataTableConfigProvider {
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
