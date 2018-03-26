import { CoreError } from "@iota-pico/core/dist/error/coreError";
/**
 * A storage implementation of an error.
 */
export declare class StorageError extends CoreError {
    /**
     * Create an instance of StorageError.
     * @param message The message for the error.
     * @param additional Additional details about the error.
     * @param innerError Add information from inner error if there was one.
     */
    constructor(message: string, additional?: {
        [id: string]: any;
    }, innerError?: Error);
}
