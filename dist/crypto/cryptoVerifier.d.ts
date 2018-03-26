import { ICryptoVerifier } from "../interfaces/ICryptoVerifier";
/**
 * CryptoVerifier can perform verification operations.
 */
export declare class CryptoVerifier implements ICryptoVerifier {
    /**
     * Create a new instance of CryptoVerifier.
     * @param publicKey The key to use for decoding messages.
     */
    constructor(publicKey: string);
    /**
     * Verify the given data.
     * @param data The data to verify.
     * @param signature The signature to verify againt the data.
     * @returns True if the verification is successful.
     */
    verify(data: string, signature: string): boolean;
}
