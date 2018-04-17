import { IDataTableConfig } from "./IDataTableConfig";

/**
 * Represents the configuration required by data tables.
 * @interface
 */
export interface IDataTableConfigCollection {
    [tableName: string]: IDataTableConfig;
}
