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
            config = await networkClient.json(undefined, "GET", `${this._bucketName}/${this._configName}.json${cacheBust}`);
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
        await networkClient.json(config, "POST", `upload/storage/v1/b/${this._bucketName}/o?name=${this._configName}.json`, {
            Authorization: `Bearer ${token}`
        });
        const permissions = {
            entity: "allUsers",
            role: "READER"
        };
        await networkClient.json(permissions, "POST", `storage/v1/b/${this._bucketName}/o/${this._configName}.json/acl`, {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ29vZ2xlU3RvcmFnZUNvbmZpZ1Byb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbmZpZ1Byb3ZpZGVyL2dvb2dsZVN0b3JhZ2VDb25maWdQcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBLDBFQUF1RTtBQUN2RSw4RkFBMkY7QUFDM0YsNEVBQXlFO0FBQ3pFLDRFQUF5RTtBQUV6RSx3RUFBcUU7QUFDckUsa0ZBQStFO0FBQy9FLHlDQUEyQjtBQUMzQix3REFBcUQ7QUFJckQ7O0dBRUc7QUFDSCxNQUFhLDJCQUEyQjtJQWFwQzs7Ozs7O09BTUc7SUFDSCxZQUFZLFVBQWtCLEVBQUUsVUFBa0IsRUFBRSxpQkFBNEMsRUFBRSxNQUFnQjtRQUM5RyxJQUFJLDJCQUFZLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQ2xDLE1BQU0sSUFBSSwyQkFBWSxDQUFDLDRDQUE0QyxDQUFDLENBQUM7U0FDeEU7UUFDRCxJQUFJLDJCQUFZLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQ2xDLE1BQU0sSUFBSSwyQkFBWSxDQUFDLDRDQUE0QyxDQUFDLENBQUM7U0FDeEU7UUFFRCxJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztRQUM5QixJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztRQUM5QixJQUFJLENBQUMsa0JBQWtCLEdBQUcsaUJBQWlCLENBQUM7UUFDNUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLElBQUksSUFBSSx1QkFBVSxFQUFFLENBQUM7SUFDOUMsQ0FBQztJQUVEOzs7T0FHRztJQUNJLEtBQUssQ0FBQyxJQUFJO1FBQ2IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsd0NBQXdDLENBQUMsQ0FBQztRQUU1RCxNQUFNLGVBQWUsR0FBRyxJQUFJLGlDQUFlLENBQUMsT0FBTyxFQUFFLHdCQUF3QixFQUFFLEdBQUcsQ0FBQyxDQUFDO1FB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