/**
 * Class for manipulating query string.
 */
export declare class QueryString {
    /**
     * Stringify the object for use in a quesry string.
     * @param obj The object to stringify.
     * @param sep The separator to use in the stringification.
     * @param eq The equals to use in the stringification.
     * @returns The stringified object.
     */
    static stringify(obj: {
        [id: string]: any;
    }, sep?: string, eq?: string): string;
    /**
     * Parse the query string into an object.
     * @param queryString The query string to parse.
     * @param sep The separator to look for.
     * @param eq The equals symbol to look for.
     * @returns The object.
     */
    static parse(queryString: string, sep?: string, eq?: string): {
        [id: string]: any;
    };
}
