import { StringHelper } from "@iota-pico/core/dist/helpers/stringHelper";
import * as crypto from "crypto";
import { StorageError } from "../error/storageError";
import { ICryptoVerifier } from "../interfaces/ICryptoVerifier";

/**
 * CryptoVerifier can perform verification operations.
 */
export class CryptoVerifier implements ICryptoVerifier {
    /* @internal */
    private _publicKey: string;

    /**
     * Create a new instance of CryptoVerifier.
     * @param publicKey The key to use for decoding messages.
     */
    constructor(publicKey: string) {
        if (StringHelper.isEmpty(publicKey)) {
            throw new StorageError("The publicKey must be a non empty string");
        }
        this._publicKey = publicKey;
    }

    /**
     * Verify the given data.
     * @param data The data to verify.
     * @param signature The signature to verify againt the data.
     * @returns True if the verification is successful.
     */
    public verify(data: string, signature: string): boolean {
        if (StringHelper.isEmpty(data)) {
            throw new StorageError("The data must be a non empty string");
        }
        if (StringHelper.isEmpty(signature)) {
            throw new StorageError("The signature must be a non empty string");
        }
        const verifier = crypto.createVerify("RSA-SHA256");
        verifier.update(data);
        return verifier.verify(this._publicKey, signature, "hex");
    }
}
