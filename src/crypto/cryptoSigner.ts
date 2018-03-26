import { StringHelper } from "@iota-pico/core/dist/helpers/stringHelper";
import * as crypto from "crypto";
import { StorageError } from "../error/storageError";
import { ICryptoSigner } from "../interfaces/ICryptoSigner";

/**
 * CryptoSigner can perform signing operations.
 */
export class CryptoSigner implements ICryptoSigner {
    /* @internal */
    private _privateKey: string;

    /**
     * Create a new instance of Cryptor.
     * @param privateKey The key to use for encoding messages.
     */
    constructor(privateKey: string) {
        if (StringHelper.isEmpty(privateKey)) {
            throw new StorageError("The privateKey must be a non empty string");
        }
        this._privateKey = privateKey;
    }

    /**
     * Sign the given data.
     * @param data The data to sign.
     * @returns The signature.
     */
    public sign(data: string): string {
        if (StringHelper.isEmpty(data)) {
            throw new StorageError("The data must be a non empty string");
        }
        const signer = crypto.createSign("RSA-SHA256");
        signer.update(data);
        return signer.sign(this._privateKey, "hex");
    }
}
