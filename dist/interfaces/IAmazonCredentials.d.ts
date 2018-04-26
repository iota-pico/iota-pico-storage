/**
 * Represents the configuration for amazon account.
 */
export interface IAmazonCredentials {
    awsAccessKeyId: string;
    awsSecretAccessKey: string;
    sessionToken?: string;
}
