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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVtb3J5Q2FjaGVDb25maWdQcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb25maWdQcm92aWRlci9tZW1vcnlDYWNoZUNvbmZpZ1Byb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSw0RUFBeUU7QUFDekUsd0RBQXFEO0FBR3JEOztHQUVHO0FBQ0gsTUFBYSx5QkFBeUI7SUFPbEM7OztPQUdHO0lBQ0gsWUFBWSxjQUErQjtRQUN2QyxJQUFJLDJCQUFZLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxFQUFFO1lBQ3RDLE1BQU0sSUFBSSwyQkFBWSxDQUFDLGdEQUFnRCxDQUFDLENBQUM7U0FDNUU7UUFFRCxJQUFJLENBQUMsZUFBZSxHQUFHLGNBQWMsQ0FBQztJQUMxQyxDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksS0FBSyxDQUFDLElBQUk7UUFDYixJQUFJLDJCQUFZLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRTtZQUN6QyxJQUFJLENBQUMsWUFBWSxHQUFHLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztTQUN6RDtRQUVELE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQztJQUM3QixDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksS0FBSyxDQUFDLElBQUksQ0FBSSxNQUFTO1FBQzFCLElBQUksQ0FBQyxZQUFZLEdBQUcsTUFBTSxDQUFDO1FBQzNCLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDekMsQ0FBQztDQUNKO0FBdkNELDhEQXVDQyJ9