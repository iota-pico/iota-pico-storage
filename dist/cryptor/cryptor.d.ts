import { ICryptor } from "../interfaces/ICryptor";
/**
 * Cryptor can perform encryption/decryption operations.
 */
export declare class Cryptor implements ICryptor {
    /**
     * Create a new instance of Cryptor.
     * @param publicKey The key to use for decoding messages.
     * @param privateKey The key to use for encoding messages.
     */
    constructor(publicKey: string, privateKey: string);
    /**
     * Encrypt the given data.
     * @param data The data to encrypt.
     * @return The encrypted data.
     */
    encrypt(data: string): string;
    /**
     * Decrypt the given data.
     * @param data The data to decrypt.
     * @return The decrypted data.
     */
    decrypt(data: string): string;
}
