/**
 * Represents an object that can perform verification operations.
 * @interface
 */
export interface ICryptoVerifier {
    /**
     * Verify the given data with the signature.
     * @param data The data to verify.
     * @param signature The signature to verify againt the data.
     * @returns True if the verification is successful.
     */
    verify(data: string, signature: string): boolean;
}
