import { ObjectHelper } from "@iota-pico/core/dist/helpers/objectHelper";
import { StringHelper } from "@iota-pico/core/dist/helpers/stringHelper";
import { ILogger } from "@iota-pico/core/dist/interfaces/ILogger";
import { NullLogger } from "@iota-pico/core/dist/loggers/nullLogger";
import { StorageError } from "../error/storageError";
import { IConfigProvider } from "../interfaces/IConfigProvider";
import { IDataTableConfig } from "../interfaces/IDataTableConfig";
import { IDataTableConfigCollection } from "../interfaces/IDataTableConfigCollection";
import { IDataTableConfigProvider } from "../interfaces/IDataTableConfigProvider";

/**
 * Represents a data table config provider which uses and IConfigProvider.
 */
export class DataTableConfigProvider implements IDataTableConfigProvider {
    /* @internal */
    private readonly _logger: ILogger;

    /* @internal */
    private readonly _configProvider: IConfigProvider;

    /**
     * Create a new instance of the DataTableConfigProvider.
     * @param configProvider The config provider to use.
     * @param logger Logger to send info to.
     */
    constructor(configProvider: IConfigProvider, logger?: ILogger) {
        if (ObjectHelper.isEmpty(configProvider)) {
            throw new StorageError("The configProvider must not be an empty IConfigProvider");
        }

        this._configProvider = configProvider;
        this._logger = logger || new NullLogger();
    }

    /**
     * Load the configuration for the data table.
     * @param tableName The table to load the configuration for.
     * @returns The configuration.
     */
    public async load(tableName: string): Promise<IDataTableConfig> {
        this._logger.info("===> DataTableConfigProvider::load", tableName);

        if (StringHelper.isEmpty(tableName)) {
            throw new StorageError("The tableName must not be an empty string");
        }

        let config;
        const configColllection = await this._configProvider.load<IDataTableConfigCollection>();

        if (configColllection[tableName]) {
            config = configColllection[tableName];
        } else {
            throw new StorageError(`The configuration does not contain a key for table '${tableName}'`);
        }

        this._logger.info("<=== DataTableConfigProvider::load", config);

        return config;
    }

    /**
     * Save the configuration for the data table.
     * @param tableName The table to save the configuration for.
     * @param config The configuration to set.
     */
    public async save(tableName: string, config: IDataTableConfig): Promise<void> {
        this._logger.info("===> DataTableConfigProvider::save", tableName, config);

        if (StringHelper.isEmpty(tableName)) {
            throw new StorageError("The tableName must not be an empty string");
        }

        if (ObjectHelper.isEmpty(config)) {
            throw new StorageError("The config parameter can not be empty");
        }

        let configColllection: IDataTableConfigCollection;
        try {
            configColllection = await this._configProvider.load<IDataTableConfigCollection>();
        } catch (err) {
        }

        if (ObjectHelper.isEmpty(configColllection)) {
            configColllection = <IDataTableConfigCollection>{};
        }

        configColllection[tableName] = config;

        await this._configProvider.save<IDataTableConfigCollection>(configColllection);

        this._logger.info("<=== DataTableConfigProvider::save", config);
    }
}
