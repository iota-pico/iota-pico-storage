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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YVRhYmxlQ29uZmlnUHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29uZmlnUHJvdmlkZXIvZGF0YVRhYmxlQ29uZmlnUHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLDRFQUF5RTtBQUN6RSw0RUFBeUU7QUFFekUsd0VBQXFFO0FBQ3JFLHdEQUFxRDtBQU1yRDs7R0FFRztBQUNIO0lBT0k7Ozs7T0FJRztJQUNILFlBQVksY0FBK0IsRUFBRSxNQUFnQjtRQUN6RCxFQUFFLENBQUMsQ0FBQywyQkFBWSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkMsTUFBTSxJQUFJLDJCQUFZLENBQUMseURBQXlELENBQUMsQ0FBQztRQUN0RixDQUFDO1FBRUQsSUFBSSxDQUFDLGVBQWUsR0FBRyxjQUFjLENBQUM7UUFDdEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLElBQUksSUFBSSx1QkFBVSxFQUFFLENBQUM7SUFDOUMsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQWlCO1FBQy9CLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLG9DQUFvQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBRW5FLEVBQUUsQ0FBQyxDQUFDLDJCQUFZLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsQyxNQUFNLElBQUksMkJBQVksQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDO1FBQ3hFLENBQUM7UUFFRCxJQUFJLE1BQU0sQ0FBQztRQUNYLE1BQU0saUJBQWlCLEdBQUcsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksRUFBOEIsQ0FBQztRQUV4RixFQUFFLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0IsTUFBTSxHQUFHLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzFDLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLE1BQU0sSUFBSSwyQkFBWSxDQUFDLHVEQUF1RCxTQUFTLEdBQUcsQ0FBQyxDQUFDO1FBQ2hHLENBQUM7UUFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxvQ0FBb0MsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUVoRSxNQUFNLENBQUMsTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFpQixFQUFFLE1BQXdCO1FBQ3pELElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLG9DQUFvQyxFQUFFLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUUzRSxFQUFFLENBQUMsQ0FBQywyQkFBWSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbEMsTUFBTSxJQUFJLDJCQUFZLENBQUMsMkNBQTJDLENBQUMsQ0FBQztRQUN4RSxDQUFDO1FBRUQsRUFBRSxDQUFDLENBQUMsMkJBQVksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9CLE1BQU0sSUFBSSwyQkFBWSxDQUFDLHVDQUF1QyxDQUFDLENBQUM7UUFDcEUsQ0FBQztRQUVELElBQUksaUJBQTZDLENBQUM7UUFDbEQsSUFBSSxDQUFDO1lBQ0QsaUJBQWlCLEdBQUcsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksRUFBOEIsQ0FBQztRQUN0RixDQUFDO1FBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNmLENBQUM7UUFFRCxFQUFFLENBQUMsQ0FBQywyQkFBWSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMxQyxpQkFBaUIsR0FBK0IsRUFBRSxDQUFDO1FBQ3ZELENBQUM7UUFFRCxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsR0FBRyxNQUFNLENBQUM7UUFFdEMsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBNkIsaUJBQWlCLENBQUMsQ0FBQztRQUUvRSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxvQ0FBb0MsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUNwRSxDQUFDO0NBQ0o7QUEvRUQsMERBK0VDIn0=