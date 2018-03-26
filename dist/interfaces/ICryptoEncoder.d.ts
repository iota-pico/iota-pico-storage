/**
 * Represents an object that can perform encryption operations.
 * @interface
 */
export interface ICryptoEncoder {
    /**
     * Encrypt the given data.
     * @param data The data to encrypt.
     * @returns The encrypted data.
     */
    encrypt(data: string): string;
}
