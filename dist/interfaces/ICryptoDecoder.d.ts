/**
 * Represents an object that can perform decryption operations.
 * @interface
 */
export interface ICryptoDecoder {
    /**
     * Decrypt the given data.
     * @param data The data to decrypt.
     * @returns The decrypted data.
     */
    decrypt(data: string): string;
}
