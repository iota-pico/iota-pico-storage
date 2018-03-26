import { ICryptoDecoder } from "../interfaces/ICryptoDecoder";
/**
 * Cryptor can perform decryption operations.
 */
export declare class CryptoDecoder implements ICryptoDecoder {
    /**
     * Create a new instance of Cryptor.
     * @param publicKey The key to use for decoding data.
     */
    constructor(publicKey: string);
    /**
     * Decrypt the given data.
     * @param data The data to decrypt.
     * @returns The decrypted data.
     */
    decrypt(data: string): string;
}
