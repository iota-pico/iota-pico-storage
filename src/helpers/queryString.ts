import { NumberHelper } from "@iota-pico/core/dist/helpers/numberHelper";
import { StringHelper } from "@iota-pico/core/dist/helpers/stringHelper";

/**
 * Class for manipulating query string.
 */
export class QueryString {
    /**
     * Stringify the object for use in a quesry string.
     * @param obj The object to stringify.
     * @param sep The separator to use in the stringification.
     * @param eq The equals to use in the stringification.
     * @returns The stringified object.
     */
    public static stringify(obj: { [id: string]: any}, sep: string = "&", eq: string = "="): string {
        return Object.keys(obj).map((k) => {
            const ks = encodeURIComponent(QueryString.stringifyPrimitive(k)) + eq;
            if (Array.isArray(obj[k])) {
                return obj[k].map((v: any) => ks + encodeURIComponent(QueryString.stringifyPrimitive(v))).join(sep);
            } else {
                return ks + encodeURIComponent(QueryString.stringifyPrimitive(obj[k]));
            }
        }).filter(Boolean).join(sep);
    }

    /**
     * Parse the query string into an object.
     * @param queryString The query string to parse.
     * @param sep The separator to look for.
     * @param eq The equals symbol to look for.
     * @returns The object.
     */
    public static parse(queryString: string, sep: string = "&", eq: string = "="): { [id: string]: any } {
        const obj: { [id: string]: any } = {};

        if (StringHelper.isString(queryString) && queryString.length > 0) {
            const regexp = /\+/g;
            const qs = queryString.split(sep);

            for (let i = 0; i < qs.length; ++i) {
                const x = qs[i].replace(regexp, "%20");
                const idx = x.indexOf(eq);
                let kstr;
                let vstr;
                let k;
                let v;

                if (idx >= 0) {
                    kstr = x.substr(0, idx);
                    vstr = x.substr(idx + 1);
                } else {
                    kstr = x;
                    vstr = "";
                }

                k = decodeURIComponent(kstr);
                v = decodeURIComponent(vstr);

                if (!Object.prototype.hasOwnProperty.call(obj, k)) {
                    obj[k] = v;
                } else if (Array.isArray(obj[k])) {
                    obj[k].push(v);
                } else {
                    obj[k] = [obj[k], v];
                }
            }
        }

        return obj;
    }

    /* @internal */
    private static stringifyPrimitive(v: any): string {
        switch (typeof v) {
            case "string":
                return v;

            case "boolean":
                return v ? "true" : "false";

            case "number":
                return NumberHelper.isNumber(v) ? v.toString() : "";

            default:
                return "";
        }
    }
}
