import { StringHelper } from "@iota-pico/core/dist/helpers/stringHelper";
import * as crypto from "crypto";
import { StorageError } from "../error/storageError";
import { ICryptoDecoder } from "../interfaces/ICryptoDecoder";

/**
 * Cryptor can perform decryption operations.
 */
export class CryptoDecoder implements ICryptoDecoder {
    /* @internal */
    private _publicKey: string;

    /**
     * Create a new instance of Cryptor.
     * @param publicKey The key to use for decoding data.
     */
    constructor(publicKey: string) {
        if (StringHelper.isEmpty(publicKey)) {
            throw new StorageError("The publicKey must be a non empty string");
        }
        this._publicKey = publicKey;
    }

    /**
     * Decrypt the given data.
     * @param data The data to decrypt.
     * @returns The decrypted data.
     */
    public decrypt(data: string): string {
        if (StringHelper.isEmpty(data)) {
            throw new StorageError("The data must be a non empty string");
        }
        const buffer = new Buffer(data, "hex");
        const decrypted = crypto.publicDecrypt(this._publicKey, buffer);
        return decrypted.toString("ascii");
    }
}
