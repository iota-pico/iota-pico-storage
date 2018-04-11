var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
}
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
            config = await networkClient.getJson(`${this._bucketName}/${this._configName}${cacheBust}`);
        }
        catch (exc) {
            let emptyConfig = false;
            if (objectHelper_1.ObjectHelper.isType(exc, networkError_1.NetworkError)) {
                if (exc.additional && exc.additional.errorResponseCode === 403) {
                    emptyConfig = true;
                }
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
        await networkClient.postJson(config, `upload/storage/v1/b/${this._bucketName}/o?name=${this._configName}`, {
            Authorization: `Bearer ${token}`
        });
        const permissions = {
            entity: "allUsers",
            role: "READER"
        };
        await networkClient.postJson(permissions, `storage/v1/b/${this._bucketName}/o/${this._configName}/acl`, {
            Authorization: `Bearer ${token}`
        });
        this._logger.info("<=== GoogleStorageConfigProvider::save");
    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ29vZ2xlU3RvcmFnZUNvbmZpZ1Byb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbmZpZ1Byb3ZpZGVyL2dvb2dsZVN0b3JhZ2VDb25maWdQcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBLDBFQUF1RTtBQUN2RSw4RkFBMkY7QUFDM0YsNEVBQXlFO0FBQ3pFLDRFQUF5RTtBQUV6RSx3RUFBcUU7QUFDckUsa0ZBQStFO0FBQy9FLHlDQUEyQjtBQUMzQix3REFBcUQ7QUFLckQ7O0dBRUc7QUFDSDtJQWFJOzs7Ozs7T0FNRztJQUNILFlBQVksVUFBa0IsRUFBRSxVQUFrQixFQUFFLGlCQUEyQyxFQUFFLE1BQWdCO1FBQzdHLEVBQUUsQ0FBQyxDQUFDLDJCQUFZLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuQyxNQUFNLElBQUksMkJBQVksQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDO1FBQ3pFLENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQywyQkFBWSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkMsTUFBTSxJQUFJLDJCQUFZLENBQUMsNENBQTRDLENBQUMsQ0FBQztRQUN6RSxDQUFDO1FBRUQsSUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUM7UUFDOUIsSUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUM7UUFDOUIsSUFBSSxDQUFDLGtCQUFrQixHQUFHLGlCQUFpQixDQUFDO1FBQzVDLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxJQUFJLElBQUksdUJBQVUsRUFBRSxDQUFDO0lBQzlDLENBQUM7SUFFRDs7O09BR0c7SUFDSSxLQUFLLENBQUMsSUFBSTtRQUNiLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLHdDQUF3QyxDQUFDLENBQUM7UUFFNUQsTUFBTSxlQUFlLEdBQUcsSUFBSSxpQ0FBZSxDQUFDLE9B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