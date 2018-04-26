/**
 * Interface to help with signing Amazon requests.
 */
export interface IAmazonRequest {
    path?: string;
    body?: string;
    host?: string;
    hostname?: string;
    port?: string;
    method?: string;
    headers?: {
        [id: string]: string;
    };
    service?: string;
    region?: string;
    signQuery?: boolean;
    doNotModifyHeaders?: boolean;
    doNotEncodePath?: boolean;
}
