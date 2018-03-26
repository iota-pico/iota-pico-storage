import { ICryptoEncoder } from "../interfaces/ICryptoEncoder";
/**
 * CryptoEncoder can perform encryption operations.
 */
export declare class CryptoEncoder implements ICryptoEncoder {
    /**
     * Create a new instance of CryptoEncoder.
     * @param privateKey The key to use for encoding data.
     */
    constructor(privateKey: string);
    /**
     * Encrypt the given data.
     * @param data The data to encrypt.
     * @returns The encrypted data.
     */
    encrypt(data: string): string;
}
