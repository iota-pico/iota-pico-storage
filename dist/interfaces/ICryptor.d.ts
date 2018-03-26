/**
 * Represents an object that can perform encryption/decryption operations.
 * @interface
 */
export interface ICryptor {
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
