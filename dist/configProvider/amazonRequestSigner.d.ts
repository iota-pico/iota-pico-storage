import { IAmazonCredentials } from "../interfaces/IAmazonCredentials";
import { IAmazonRequest } from "../interfaces/IAmazonRequest";
/**
 * Class to help with signing Amazon requests.
 */
export declare class AmazonRequestSigner {
    /**
     * Create a new instance of AmazonRequestSigner.
     * @param request The request to be signed.
     * @param credentials The credentials to use for signing.
     */
    constructor(request: IAmazonRequest, credentials: IAmazonCredentials);
    /**
     * Signed the request.
     * @returns The signed request.
     */
    sign(): IAmazonRequest;
}
