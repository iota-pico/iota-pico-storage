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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YVRhYmxlQ29uZmlnUHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29uZmlnUHJvdmlkZXIvZGF0YVRhYmxlQ29uZmlnUHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLDRFQUF5RTtBQUN6RSw0RUFBeUU7QUFFekUsd0VBQXFFO0FBQ3JFLHdEQUFxRDtBQU1yRDs7R0FFRztBQUNILE1BQWEsdUJBQXVCO0lBT2hDOzs7O09BSUc7SUFDSCxZQUFZLGNBQStCLEVBQUUsTUFBZ0I7UUFDekQsSUFBSSwyQkFBWSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsRUFBRTtZQUN0QyxNQUFNLElBQUksMkJBQVksQ0FBQyx5REFBeUQsQ0FBQyxDQUFDO1NBQ3JGO1FBRUQsSUFBSSxDQUFDLGVBQWUsR0FBRyxjQUFjLENBQUM7UUFDdEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLElBQUksSUFBSSx1QkFBVSxFQUFFLENBQUM7SUFDOUMsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQWlCO1FBQy9CLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLG9DQUFvQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBRW5FLElBQUksMkJBQVksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDakMsTUFBTSxJQUFJLDJCQUFZLENBQUMsMkNBQTJDLENBQUMsQ0FBQztTQUN2RTtRQUVELElBQUksTUFBTSxDQUFDO1FBQ1gsTUFBTSxpQkFBaUIsR0FBRyxNQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUE4QixDQUFDO1FBRXhGLElBQUksaUJBQWlCLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDOUIsTUFBTSxHQUFHLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1NBQ3pDO2FBQU07WUFDSCxNQUFNLElBQUksMkJBQVksQ0FBQyx1REFBdUQsU0FBUyxHQUFHLENBQUMsQ0FBQztTQUMvRjtRQUVELElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLG9DQUFvQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRWhFLE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFpQixFQUFFLE1BQXdCO1FBQ3pELElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLG9DQUFvQyxFQUFFLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUUzRSxJQUFJLDJCQUFZLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQ2pDLE1BQU0sSUFBSSwyQkFBWSxDQUFDLDJDQUEyQyxDQUFDLENBQUM7U0FDdkU7UUFFRCxJQUFJLDJCQUFZLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQzlCLE1BQU0sSUFBSSwyQkFBWSxDQUFDLHVDQUF1QyxDQUFDLENBQUM7U0FDbkU7UUFFRCxJQUFJLGlCQUE2QyxDQUFDO1FBQ2xELElBQUk7WUFDQSxpQkFBaUIsR0FBRyxNQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUE4QixDQUFDO1NBQ3JGO1FBQUMsT0FBTyxHQUFHLEVBQUU7U0FDYjtRQUVELElBQUksMkJBQVksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsRUFBRTtZQUN6QyxpQkFBaUIsR0FBK0IsRUFBRSxDQUFDO1NBQ3REO1FBRUQsaUJBQWlCLENBQUMsU0FBUyxDQUFDLEdBQUcsTUFBTSxDQUFDO1FBRXRDLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQTZCLGlCQUFpQixDQUFDLENBQUM7UUFFL0UsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsb0NBQW9DLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDcEUsQ0FBQztDQUNKO0FBL0VELDBEQStFQyJ9