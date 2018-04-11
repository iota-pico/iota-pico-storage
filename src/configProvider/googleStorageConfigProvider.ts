import { NetworkError } from "@iota-pico/core/dist/error/networkError";
import { NetworkClientFactory } from "@iota-pico/core/dist/factories/networkClientFactory";
import { ObjectHelper } from "@iota-pico/core/dist/helpers/objectHelper";
import { StringHelper } from "@iota-pico/core/dist/helpers/stringHelper";
import { ILogger } from "@iota-pico/core/dist/interfaces/ILogger";
import { NullLogger } from "@iota-pico/core/dist/loggers/nullLogger";
import { NetworkEndPoint } from "@iota-pico/core/dist/network/networkEndPoint";
import * as jws from "jws";
import { StorageError } from "../error/storageError";
import { IDataTableConfig } from "../interfaces/IDataTableConfig";
import { IDataTableConfigProvider } from "../interfaces/IDataTableConfigProvider";
import { IGoogleServiceAccountKey } from "../interfaces/IGoogleServiceAccountKey";

/**
 * Represents a config provider which uses google storage.
 */
export class GoogleStorageConfigProvider implements IDataTableConfigProvider {
    /* @internal */
    private readonly _logger: ILogger;

    /* @internal */
    private readonly _bucketName: string;

    /* @internal */
    private readonly _configName: string;

    /* @internal */
    private readonly _serviceAccountKey: IGoogleServiceAccountKey;

    /**
     * Create a new instance of the GoogleStorageConfigProvider.
     * @param bucketName The name of the bucket object.
     * @param configName The name of the configuration object.
     * @param serviceAccountKey The key to acccess the google api.
     * @param logger Logger to send info to.
     */
    constructor(bucketName: string, configName: string, serviceAccountKey: IGoogleServiceAccountKey, logger?: ILogger) {
        if (StringHelper.isEmpty(bucketName)) {
            throw new StorageError("The bucketName must not be an empty string");
        }
        if (StringHelper.isEmpty(configName)) {
            throw new StorageError("The configName must not be an empty string");
        }

        this._bucketName = bucketName;
        this._configName = configName;
        this._serviceAccountKey = serviceAccountKey;
        this._logger = logger || new NullLogger();
    }

    /**
     * Load the configuration for the data table.
     * @returns The configuration.
     */
    public async load(): Promise<IDataTableConfig> {
        this._logger.info("===> GoogleStorageConfigProvider::load");

        const networkEndpoint = new NetworkEndPoint("https", "storage.googleapis.com", 443);
        const networkClient = NetworkClientFactory.instance().create("default", networkEndpoint, this._logger);

        // Use a cache bust when we are doing admin
        const cacheBust = ObjectHelper.isEmpty(this._serviceAccountKey) ? "" : `?cachebust=${Date.now()}`;

        let config: IDataTableConfig;

        try {
            config = await networkClient.getJson<IDataTableConfig>(`${this._bucketName}/${this._configName}${cacheBust}`);
        } catch (exc) {
            let emptyConfig = false;
            if (ObjectHelper.isType(exc, NetworkError)) {
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
    public async save(config: IDataTableConfig): Promise<void> {
        this._logger.info("===> GoogleStorageConfigProvider::save");

        if (ObjectHelper.isEmpty(this._serviceAccountKey)) {
            throw new StorageError("The serviceAccountKey must be set for save operations");
        }

        if (ObjectHelper.isEmpty(config)) {
            throw new StorageError("The config parameter can not be empty");
        }

        const networkEndpoint = new NetworkEndPoint("https", "www.googleapis.com", 443);
        const networkClient = NetworkClientFactory.instance().create("default", networkEndpoint, this._logger);

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

    private async getToken(scope: string): Promise<string> {
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

        const networkEndpoint = new NetworkEndPoint("https", "www.googleapis.com", 443);
        const networkClient = NetworkClientFactory.instance().create("default", networkEndpoint, this._logger);

        const sendData = `grant_type=${encodeURIComponent("urn:ietf:params:oauth:grant-type:jwt-bearer")}&assertion=${encodeURIComponent(signedJWT)}`;

        const resp = await networkClient.post(sendData, `oauth2/v4/token`, { "Content-Type": "application/x-www-form-urlencoded" });

        const response: {
            refresh_token?: string;
            expires_in?: number;
            access_token?: string;
            token_type?: string;
            id_token?: string;
        } = JSON.parse(resp);

        this._logger.info("<=== GoogleStorageConfigProvider::getToken", response);

        return response.access_token;
    }
}
