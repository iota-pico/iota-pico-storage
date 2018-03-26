/**
 * Represents an object that can perform signing operations.
 * @interface
 */
export interface ICryptoSigner {
    /**
     * Sign the given data.
     * @param data The data to sign.
     * @returns The signature.
     */
    sign(data: string): string;
}
