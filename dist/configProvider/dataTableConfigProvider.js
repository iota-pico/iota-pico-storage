Object.defineProperty(exports, "__esModule", { value: true });
const objectHelper_1 = require("@iota-pico/core/dist/helpers/objectHelper");
const stringHelper_1 = require("@iota-pico/core/dist/helpers/stringHelper");
const nullLogger_1 = require("@iota-pico/core/dist/loggers/nullLogger");
const storageError_1 = require("../error/storageError");
/**
 * Represents a data table config provider which uses and IConfigProvider.
 */
class DataTableConfigProvider {
    /**
     * Create a new instance of the DataTableConfigProvider.
     * @param configProvider The config provider to use.
     * @param logger Logger to send info to.
     */
    constructor(configProvider, logger) {
        if (objectHelper_1.ObjectHelper.isEmpty(configProvider)) {
            throw new storageError_1.StorageError("The configProvider must not be an empty IConfigProvider");
        }
        this._configProvider = configProvider;
        this._logger = logger || new nullLogger_1.NullLogger();
    }
    /**
     * Load the configuration for the data table.
     * @param tableName The table to load the configuration for.
     * @returns The configuration.
     */
    async load(tableName) {
        this._logger.info("===> DataTableConfigProvider::load", tableName);
        if (stringHelper_1.StringHelper.isEmpty(tableName)) {
            throw new storageError_1.StorageError("The tableName must not be an empty string");
        }
        let config;
        const configColllection = await this._configProvider.load();
        if (configColllection[tableName]) {
            config = configColllection[tableName];
        }
        else {
            throw new storageError_1.StorageError(`The configuration does not contain a key for table '${tableName}'`);
        }
        this._logger.info("<=== DataTableConfigProvider::load", config);
        return config;
    }
    /**
     * Save the configuration for the data table.
     * @param tableName The table to save the configuration for.
     * @param config The configuration to set.
     */
    async save(tableName, config) {
        this._logger.info("===> DataTableConfigProvider::save", tableName, config);
        if (stringHelper_1.StringHelper.isEmpty(tableName)) {
            throw new storageError_1.StorageError("The tableName must not be an empty string");
        }
        if (objectHelper_1.ObjectHelper.isEmpty(config)) {
            throw new storageError_1.StorageError("The config parameter can not be empty");
        }
        let configColllection;
        try {
            configColllection = await this._configProvider.load();
        }
        catch (err) {
        }
        if (objectHelper_1.ObjectHelper.isEmpty(configColllection)) {
            configColllection = {};
        }
        configColllection[tableName] = config;
        await this._configProvider.save(configColllection);
        this._logger.info("<=== DataTableConfigProvider::save", config);
    }
}
exports.DataTableConfigProvider = DataTableConfigProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YVRhYmxlQ29uZmlnUHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29uZmlnUHJvdmlkZXIvZGF0YVRhYmxlQ29uZmlnUHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLDRFQUF5RTtBQUN6RSw0RUFBeUU7QUFFekUsd0VBQXFFO0FBQ3JFLHdEQUFxRDtBQU1yRDs7R0FFRztBQUNIO0lBT0k7Ozs7T0FJRztJQUNILFlBQVksY0FBK0IsRUFBRSxNQUFnQjtRQUN6RCxJQUFJLDJCQUFZLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxFQUFFO1lBQ3RDLE1BQU0sSUFBSSwyQkFBWSxDQUFDLHlEQUF5RCxDQUFDLENBQUM7U0FDckY7UUFFRCxJQUFJLENBQUMsZUFBZSxHQUFHLGNBQWMsQ0FBQztRQUN0QyxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sSUFBSSxJQUFJLHVCQUFVLEVBQUUsQ0FBQztJQUM5QyxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNJLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBaUI7UUFDL0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsb0NBQW9DLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFFbkUsSUFBSSwyQkFBWSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUNqQyxNQUFNLElBQUksMkJBQVksQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDO1NBQ3ZFO1FBRUQsSUFBSSxNQUFNLENBQUM7UUFDWCxNQUFNLGlCQUFpQixHQUFHLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQThCLENBQUM7UUFFeEYsSUFBSSxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUM5QixNQUFNLEdBQUcsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDekM7YUFBTTtZQUNILE1BQU0sSUFBSSwyQkFBWSxDQUFDLHVEQUF1RCxTQUFTLEdBQUcsQ0FBQyxDQUFDO1NBQy9GO1FBRUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsb0NBQW9DLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFFaEUsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQWlCLEVBQUUsTUFBd0I7UUFDekQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsb0NBQW9DLEVBQUUsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRTNFLElBQUksMkJBQVksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDakMsTUFBTSxJQUFJLDJCQUFZLENBQUMsMkNBQTJDLENBQUMsQ0FBQztTQUN2RTtRQUVELElBQUksMkJBQVksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDOUIsTUFBTSxJQUFJLDJCQUFZLENBQUMsdUNBQXVDLENBQUMsQ0FBQztTQUNuRTtRQUVELElBQUksaUJBQTZDLENBQUM7UUFDbEQsSUFBSTtZQUNBLGlCQUFpQixHQUFHLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQThCLENBQUM7U0FDckY7UUFBQyxPQUFPLEdBQUcsRUFBRTtTQUNiO1FBRUQsSUFBSSwyQkFBWSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFO1lBQ3pDLGlCQUFpQixHQUErQixFQUFFLENBQUM7U0FDdEQ7UUFFRCxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsR0FBRyxNQUFNLENBQUM7UUFFdEMsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBNkIsaUJBQWlCLENBQUMsQ0FBQztRQUUvRSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxvQ0FBb0MsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUNwRSxDQUFDO0NBQ0o7QUEvRUQsMERBK0VDIn0=