var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const networkError_1 = require("@iota-pico/core/dist/error/networkError");
const networkClientFactory_1 = require("@iota-pico/core/dist/factories/networkClientFactory");
const objectHelper_1 = require("@iota-pico/core/dist/helpers/objectHelper");
const stringHelper_1 = require("@iota-pico/core/dist/helpers/stringHelper");
const nullLogger_1 = require("@iota-pico/core/dist/loggers/nullLogger");
const networkEndPoint_1 = require("@iota-pico/core/dist/network/networkEndPoint");
const jws = __importStar(require("jws"));
const storageError_1 = require("../error/storageError");
/**
 * Represents a config provider which uses google storage.
 */
class GoogleStorageConfigProvider {
    /**
     * Create a new instance of the GoogleStorageConfigProvider.
     * @param bucketName The name of the bucket object.
     * @param configName The name of the configuration object.
     * @param serviceAccountKey The key to acccess the google api.
     * @param logger Logger to send info to.
     */
    constructor(bucketName, configName, serviceAccountKey, logger) {
        if (stringHelper_1.StringHelper.isEmpty(bucketName)) {
            throw new storageError_1.StorageError("The bucketName must not be an empty string");
        }
        if (stringHelper_1.StringHelper.isEmpty(configName)) {
            throw new storageError_1.StorageError("The configName must not be an empty string");
        }
        this._bucketName = bucketName;
        this._configName = configName;
        this._serviceAccountKey = serviceAccountKey;
        this._logger = logger || new nullLogger_1.NullLogger();
    }
    /**
     * Load the configuration for the data table.
     * @returns The configuration.
     */
    async load() {
        this._logger.info("===> GoogleStorageConfigProvider::load");
        const networkEndpoint = new networkEndPoint_1.NetworkEndPoint("https", "storage.googleapis.com", 443);
        const networkClient = networkClientFactory_1.NetworkClientFactory.instance().create("default", networkEndpoint, this._logger);
        // Use a cache bust when we are doing admin
        const cacheBust = objectHelper_1.ObjectHelper.isEmpty(this._serviceAccountKey) ? "" : `?cachebust=${Date.now()}`;
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
        this._logger.info("<=== GoogleStorageConfigProvider::load", config);
        return config;
    }
    /**
     * Save the configuration for the data table.
     * @param config The configuration to set.
     */
    async save(config) {
        this._logger.info("===> GoogleStorageConfigProvider::save");
        if (objectHelper_1.ObjectHelper.isEmpty(this._serviceAccountKey)) {
            throw new storageError_1.StorageError("The serviceAccountKey must be set for save operations");
        }
        if (objectHelper_1.ObjectHelper.isEmpty(config)) {
            throw new storageError_1.StorageError("The config parameter can not be empty");
        }
        const networkEndpoint = new networkEndPoint_1.NetworkEndPoint("https", "www.googleapis.com", 443);
        const networkClient = networkClientFactory_1.NetworkClientFactory.instance().create("default", networkEndpoint, this._logger);
        const token = await this.getToken("https://www.googleapis.com/auth/devstorage.full_control");
        await networkClient.postJson(config, `upload/storage/v1/b/${this._bucketName}/o?name=${this._configName}.json`, {
            Authorization: `Bearer ${token}`
        });
        const permissions = {
            entity: "allUsers",
            role: "READER"
        };
        await networkClient.postJson(permissions, `storage/v1/b/${this._bucketName}/o/${this._configName}.json/acl`, {
            Authorization: `Bearer ${token}`
        });
        this._logger.info("<=== GoogleStorageConfigProvider::save");
    }
    /* @internal */
    async getToken(scope) {
        this._logger.info("===> GoogleStorageConfigProvider::getToken");
        const iat = Math.floor(new Date().getTime() / 1000);
        const payload = {
            iss: this._serviceAccountKey.client_email,
            scope,
            aud: "https://www.googleapis.com/oauth2/v4/token",
            exp: iat + 3600,
            iat
        };
        const signedJWT = jws.sign({ header: { alg: "RS256" }, payload, secret: this._serviceAccountKey.private_key });
        const networkEndpoint = new networkEndPoint_1.NetworkEndPoint("https", "www.googleapis.com", 443);
        const networkClient = networkClientFactory_1.NetworkClientFactory.instance().create("default", networkEndpoint, this._logger);
        const sendData = `grant_type=${encodeURIComponent("urn:ietf:params:oauth:grant-type:jwt-bearer")}&assertion=${encodeURIComponent(signedJWT)}`;
        const resp = await networkClient.post(sendData, `oauth2/v4/token`, { "Content-Type": "application/x-www-form-urlencoded" });
        const response = JSON.parse(resp);
        this._logger.info("<=== GoogleStorageConfigProvider::getToken", response);
        return response.access_token;
    }
}
exports.GoogleStorageConfigProvider = GoogleStorageConfigProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ29vZ2xlU3RvcmFnZUNvbmZpZ1Byb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbmZpZ1Byb3ZpZGVyL2dvb2dsZVN0b3JhZ2VDb25maWdQcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBLDBFQUF1RTtBQUN2RSw4RkFBMkY7QUFDM0YsNEVBQXlFO0FBQ3pFLDRFQUF5RTtBQUV6RSx3RUFBcUU7QUFDckUsa0ZBQStFO0FBQy9FLHlDQUEyQjtBQUMzQix3REFBcUQ7QUFJckQ7O0dBRUc7QUFDSDtJQWFJOzs7Ozs7T0FNRztJQUNILFlBQVksVUFBa0IsRUFBRSxVQUFrQixFQUFFLGlCQUE0QyxFQUFFLE1BQWdCO1FBQzlHLElBQUksMkJBQVksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDbEMsTUFBTSxJQUFJLDJCQUFZLENBQUMsNENBQTRDLENBQUMsQ0FBQztTQUN4RTtRQUNELElBQUksMkJBQVksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDbEMsTUFBTSxJQUFJLDJCQUFZLENBQUMsNENBQTRDLENBQUMsQ0FBQztTQUN4RTtRQUVELElBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO1FBQzlCLElBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO1FBQzlCLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxpQkFBaUIsQ0FBQztRQUM1QyxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sSUFBSSxJQUFJLHVCQUFVLEVBQUUsQ0FBQztJQUM5QyxDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksS0FBSyxDQUFDLElBQUk7UUFDYixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO1FBRTVELE1BQU0sZUFBZSxHQUFHLElBQUksaUNBQWUsQ0FBQyxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDcEYsTUFBTSxhQUFh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