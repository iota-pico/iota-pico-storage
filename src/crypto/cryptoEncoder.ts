import { StringHelper } from "@iota-pico/core/dist/helpers/stringHelper";
import * as crypto from "crypto";
import { StorageError } from "../error/storageError";
import { ICryptoEncoder } from "../interfaces/ICryptoEncoder";

/**
 * CryptoEncoder can perform encryption operations.
 */
export class CryptoEncoder implements ICryptoEncoder {
    /* @internal */
    private _privateKey: string;

    /**
     * Create a new instance of CryptoEncoder.
     * @param privateKey The key to use for encoding data.
     */
    constructor(privateKey: string) {
        if (StringHelper.isEmpty(privateKey)) {
            throw new StorageError("The privateKey must be a non empty string");
        }
        this._privateKey = privateKey;
    }

    /**
     * Encrypt the given data.
     * @param data The data to encrypt.
     * @returns The encrypted data.
     */
    public encrypt(data: string): string {
        if (StringHelper.isEmpty(data)) {
            throw new StorageError("The data must be a non empty string");
        }
        const buffer = new Buffer(data, "ascii");
        const encrypted = crypto.privateEncrypt(this._privateKey, buffer);
        return encrypted.toString("hex");
    }
}
