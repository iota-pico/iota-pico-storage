Object.defineProperty(exports, "__esModule", { value: true });
const objectHelper_1 = require("@iota-pico/core/dist/helpers/objectHelper");
const storageError_1 = require("../error/storageError");
/**
 * Represents a config provider which caches content from another provider.
 */
class MemoryCacheConfigProvider {
    /**
     * Create a new instance of the MemoryCacheConfigProvider.
     * @param configProvider The config provider to cache.
     */
    constructor(configProvider) {
        if (objectHelper_1.ObjectHelper.isEmpty(configProvider)) {
            throw new storageError_1.StorageError("The configProvider must not be an empty object");
        }
        this._configProvider = configProvider;
    }
    /**
     * Load the configuration for the data table.
     * @returns The configuration.
     */
    async load() {
        if (objectHelper_1.ObjectHelper.isEmpty(this._cacheConfig)) {
            this._cacheConfig = await this._configProvider.load();
        }
        return this._cacheConfig;
    }
    /**
     * Save the configuration for the data table.
     * @param config The configuration to set.
     */
    async save(config) {
        this._cacheConfig = config;
        await this._cacheConfig.save(config);
    }
}
exports.MemoryCacheConfigProvider = MemoryCacheConfigProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVtb3J5Q2FjaGVDb25maWdQcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb25maWdQcm92aWRlci9tZW1vcnlDYWNoZUNvbmZpZ1Byb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSw0RUFBeUU7QUFDekUsd0RBQXFEO0FBR3JEOztHQUVHO0FBQ0g7SUFPSTs7O09BR0c7SUFDSCxZQUFZLGNBQStCO1FBQ3ZDLElBQUksMkJBQVksQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLEVBQUU7WUFDdEMsTUFBTSxJQUFJLDJCQUFZLENBQUMsZ0RBQWdELENBQUMsQ0FBQztTQUM1RTtRQUVELElBQUksQ0FBQyxlQUFlLEdBQUcsY0FBYyxDQUFDO0lBQzFDLENBQUM7SUFFRDs7O09BR0c7SUFDSSxLQUFLLENBQUMsSUFBSTtRQUNiLElBQUksMkJBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFO1lBQ3pDLElBQUksQ0FBQyxZQUFZLEdBQUcsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxDQUFDO1NBQ3pEO1FBRUQsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDO0lBQzdCLENBQUM7SUFFRDs7O09BR0c7SUFDSSxLQUFLLENBQUMsSUFBSSxDQUFJLE1BQVM7UUFDMUIsSUFBSSxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUM7UUFDM0IsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN6QyxDQUFDO0NBQ0o7QUF2Q0QsOERBdUNDIn0=