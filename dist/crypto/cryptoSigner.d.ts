import { ICryptoSigner } from "../interfaces/ICryptoSigner";
/**
 * CryptoSigner can perform signing operations.
 */
export declare class CryptoSigner implements ICryptoSigner {
    /**
     * Create a new instance of Cryptor.
     * @param privateKey The key to use for encoding messages.
     */
    constructor(privateKey: string);
    /**
     * Sign the given data.
     * @param data The data to sign.
     * @returns The signature.
     */
    sign(data: string): string;
}
