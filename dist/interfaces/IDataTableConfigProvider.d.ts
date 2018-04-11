import { IDataTableConfig } from "./IDataTableConfig";
/**
 * Represents a class that can get/set data table configuration.
 * @interface
 */
export interface IDataTableConfigProvider {
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
}
