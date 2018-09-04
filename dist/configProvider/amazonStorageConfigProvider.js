Object.defineProperty(exports, "__esModule", { value: true });
const networkError_1 = require("@iota-pico/core/dist/error/networkError");
const networkClientFactory_1 = require("@iota-pico/core/dist/factories/networkClientFactory");
const objectHelper_1 = require("@iota-pico/core/dist/helpers/objectHelper");
const stringHelper_1 = require("@iota-pico/core/dist/helpers/stringHelper");
const nullLogger_1 = require("@iota-pico/core/dist/loggers/nullLogger");
const networkEndPoint_1 = require("@iota-pico/core/dist/network/networkEndPoint");
const storageError_1 = require("../error/storageError");
const amazonRequestSigner_1 = require("./amazonRequestSigner");
/**
 * Represents a config provider which uses amazon storage.
 */
class AmazonStorageConfigProvider {
    /**
     * Create a new instance of the AmazonStorageConfigProvider.
     * @param region The name of the region.
     * @param bucketName The name of the bucket object.
     * @param configName The name of the configuration object.
     * @param credentials The key to acccess the amazon api.
     * @param logger Logger to send info to.
     */
    constructor(region, bucketName, configName, credentials, logger) {
        if (stringHelper_1.StringHelper.isEmpty(region)) {
            throw new storageError_1.StorageError("The region must not be an empty string");
        }
        if (stringHelper_1.StringHelper.isEmpty(bucketName)) {
            throw new storageError_1.StorageError("The bucketName must not be an empty string");
        }
        if (stringHelper_1.StringHelper.isEmpty(configName)) {
            throw new storageError_1.StorageError("The configName must not be an empty string");
        }
        this._region = region;
        this._bucketName = bucketName;
        this._configName = configName;
        this._credentials = credentials;
        this._logger = logger || new nullLogger_1.NullLogger();
    }
    /**
     * Load the configuration for the data table.
     * @returns The configuration.
     */
    async load() {
        this._logger.info("===> AmazonStorageConfigProvider::load");
        const networkEndpoint = new networkEndPoint_1.NetworkEndPoint("https", `s3.${this._region}.amazonaws.com`, 443);
        const networkClient = networkClientFactory_1.NetworkClientFactory.instance().create("default", networkEndpoint, this._logger);
        // Use a cache bust when we are doing admin
        const cacheBust = objectHelper_1.ObjectHelper.isEmpty(this._credentials) ? "" : `?cachebust=${Date.now()}`;
        let config;
        try {
            config = await networkClient.getJson(`${this._bucketName}/${this._configName}.json${cacheBust}`);
        }
        catch (exc) {
            let emptyConfig = false;
            if (objectHelper_1.ObjectHelper.isType(exc, networkError_1.NetworkError)) {
                emptyConfig = true;
            }
            if (!emptyConfig) {
                throw exc;
            }
        }
        this._logger.info("<=== AmazonStorageConfigProvider::load", config);
        return config;
    }
    /**
     * Save the configuration for the data table.
     * @param config The configuration to set.
     */
    async save(config) {
        this._logger.info("===> AmazonStorageConfigProvider::save");
        if (objectHelper_1.ObjectHelper.isEmpty(this._credentials)) {
            throw new storageError_1.StorageError("The serviceAccountKey must be set for save operations");
        }
        if (objectHelper_1.ObjectHelper.isEmpty(config)) {
            throw new storageError_1.StorageError("The config parameter can not be empty");
        }
        const filename = `/${this._bucketName}/${this._configName}.json`;
        const content = JSON.stringify(config);
        const request = {
            service: "s3",
            region: this._region,
            method: "PUT",
            path: filename,
            headers: {
                "Content-Type": "application/json",
                "Content-Length": content.length.toString(),
                "x-amz-acl": "public-read"
            },
            body: content
        };
        const requestSigner = new amazonRequestSigner_1.AmazonRequestSigner(request, this._credentials);
        const signedRequest = requestSigner.sign();
        const networkEndpoint = new networkEndPoint_1.NetworkEndPoint("https", signedRequest.hostname, 443);
        const networkClient = networkClientFactory_1.NetworkClientFactory.instance().create("default", networkEndpoint, this._logger);
        await networkClient.doRequest("PUT", content, filename, signedRequest.headers);
        this._logger.info("<=== AmazonStorageConfigProvider::save");
    }
}
exports.AmazonStorageConfigProvider = AmazonStorageConfigProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW1hem9uU3RvcmFnZUNvbmZpZ1Byb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbmZpZ1Byb3ZpZGVyL2FtYXpvblN0b3JhZ2VDb25maWdQcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsMEVBQXVFO0FBQ3ZFLDhGQUEyRjtBQUMzRiw0RUFBeUU7QUFDekUsNEVBQXlFO0FBRXpFLHdFQUFxRTtBQUNyRSxrRkFBK0U7QUFDL0Usd0RBQXFEO0FBR3JELCtEQUE0RDtBQUU1RDs7R0FFRztBQUNILE1BQWEsMkJBQTJCO0lBZ0JwQzs7Ozs7OztPQU9HO0lBQ0gsWUFBWSxNQUFjLEVBQUUsVUFBa0IsRUFBRSxVQUFrQixFQUFFLFdBQWdDLEVBQUUsTUFBZ0I7UUFDbEgsSUFBSSwyQkFBWSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUM5QixNQUFNLElBQUksMkJBQVksQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO1NBQ3BFO1FBQ0QsSUFBSSwyQkFBWSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUNsQyxNQUFNLElBQUksMkJBQVksQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDO1NBQ3hFO1FBQ0QsSUFBSSwyQkFBWSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUNsQyxNQUFNLElBQUksMkJBQVksQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDO1NBQ3hFO1FBRUQsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7UUFDdEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUM7UUFDOUIsSUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUM7UUFDOUIsSUFBSSxDQUFDLFlBQVksR0FBRyxXQUFXLENBQUM7UUFDaEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLElBQUksSUFBSSx1QkFBVSxFQUFFLENBQUM7SUFDOUMsQ0FBQztJQUVEOzs7T0FHRztJQUNJLEtBQUssQ0FBQyxJ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