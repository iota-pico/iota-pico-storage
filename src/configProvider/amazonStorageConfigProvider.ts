import { NetworkError } from "@iota-pico/core/dist/error/networkError";
import { NetworkClientFactory } from "@iota-pico/core/dist/factories/networkClientFactory";
import { ObjectHelper } from "@iota-pico/core/dist/helpers/objectHelper";
import { StringHelper } from "@iota-pico/core/dist/helpers/stringHelper";
import { ILogger } from "@iota-pico/core/dist/interfaces/ILogger";
import { NullLogger } from "@iota-pico/core/dist/loggers/nullLogger";
import { NetworkEndPoint } from "@iota-pico/core/dist/network/networkEndPoint";
import { StorageError } from "../error/storageError";
import { IAmazonCredentials } from "../interfaces/IAmazonCredentials";
import { IConfigProvider } from "../interfaces/IConfigProvider";
import { AmazonRequestSigner } from "./amazonRequestSigner";

/**
 * Represents a config provider which uses amazon storage.
 */
export class AmazonStorageConfigProvider implements IConfigProvider {
    /* @internal */
    private readonly _logger: ILogger;

    /* @internal */
    private readonly _region: string;

    /* @internal */
    private readonly _bucketName: string;

    /* @internal */
    private readonly _configName: string;

    /* @internal */
    private readonly _credentials: IAmazonCredentials;

    /**
     * Create a new instance of the AmazonStorageConfigProvider.
     * @param region The name of the region.
     * @param bucketName The name of the bucket object.
     * @param configName The name of the configuration object.
     * @param credentials The key to acccess the amazon api.
     * @param logger Logger to send info to.
     */
    constructor(region: string, bucketName: string, configName: string, credentials?: IAmazonCredentials, logger?: ILogger) {
        if (StringHelper.isEmpty(region)) {
            throw new StorageError("The region must not be an empty string");
        }
        if (StringHelper.isEmpty(bucketName)) {
            throw new StorageError("The bucketName must not be an empty string");
        }
        if (StringHelper.isEmpty(configName)) {
            throw new StorageError("The configName must not be an empty string");
        }

        this._region = region;
        this._bucketName = bucketName;
        this._configName = configName;
        this._credentials = credentials;
        this._logger = logger || new NullLogger();
    }

    /**
     * Load the configuration for the data table.
     * @returns The configuration.
     */
    public async load<T>(): Promise<T> {
        this._logger.info("===> AmazonStorageConfigProvider::load");

        const networkEndpoint = new NetworkEndPoint("https", `s3.${this._region}.amazonaws.com`, 443);
        const networkClient = NetworkClientFactory.instance().create("default", networkEndpoint, this._logger);

        // Use a cache bust when we are doing admin
        const cacheBust = ObjectHelper.isEmpty(this._credentials) ? "" : `?cachebust=${Date.now()}`;

        let config: T;

        try {
            config = await networkClient.getJson<T>(`${this._bucketName}/${this._configName}.json${cacheBust}`);
        } catch (exc) {
            let emptyConfig = false;
            if (ObjectHelper.isType(exc, NetworkError)) {
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
    public async save<T>(config: T): Promise<void> {
        this._logger.info("===> AmazonStorageConfigProvider::save");

        if (ObjectHelper.isEmpty(this._credentials)) {
            throw new StorageError("The serviceAccountKey must be set for save operations");
        }

        if (ObjectHelper.isEmpty(config)) {
            throw new StorageError("The config parameter can not be empty");
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

        const requestSigner = new AmazonRequestSigner(request, this._credentials);

        const signedRequest = requestSigner.sign();

        const networkEndpoint = new NetworkEndPoint("https", signedRequest.hostname, 443);
        const networkClient = NetworkClientFactory.instance().create("default", networkEndpoint, this._logger);

        await networkClient.doRequest("PUT", content, filename, signedRequest.headers);

        this._logger.info("<=== AmazonStorageConfigProvider::save");
    }
}
