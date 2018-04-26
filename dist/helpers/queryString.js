Object.defineProperty(exports, "__esModule", { value: true });
const stringHelper_1 = require("@iota-pico/core/dist/helpers/stringHelper");
/**
 * Class for manipulating query string.
 */
class QueryString {
    /**
     * Stringify the object for use in a quesry string.
     * @param obj The object to stringify.
     * @param sep The separator to use in the stringification.
     * @param eq The equals to use in the stringification.
     * @returns The stringified object.
     */
    static stringify(obj, sep = "&", eq = "=") {
        return Object.keys(obj).map((k) => {
            const ks = encodeURIComponent(QueryString.stringifyPrimitive(k)) + eq;
            if (Array.isArray(obj[k])) {
                return obj[k].map((v) => ks + encodeURIComponent(QueryString.stringifyPrimitive(v))).join(sep);
            }
            else {
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
    static parse(queryString, sep = "&", eq = "=") {
        const obj = {};
        if (stringHelper_1.StringHelper.isString(queryString) && queryString.length > 0) {
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
                }
                else {
                    kstr = x;
                    vstr = "";
                }
                k = decodeURIComponent(kstr);
                v = decodeURIComponent(vstr);
                if (!Object.prototype.hasOwnProperty.call(obj, k)) {
                    obj[k] = v;
                }
                else if (Array.isArray(obj[k])) {
                    obj[k].push(v);
                }
                else {
                    obj[k] = [obj[k], v];
                }
            }
        }
        return obj;
    }
    /* @internal */
    static stringifyPrimitive(v) {
        switch (typeof v) {
            case "string":
                return v;
            case "boolean":
                return v ? "true" : "false";
            case "number":
                return isFinite(v) ? v : "";
            default:
                return "";
        }
    }
}
exports.QueryString = QueryString;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnlTdHJpbmcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaGVscGVycy9xdWVyeVN0cmluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsNEVBQXlFO0FBRXpFOztHQUVHO0FBQ0g7SUFDSTs7Ozs7O09BTUc7SUFDSSxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQXlCLEVBQUUsTUFBYyxHQUFHLEVBQUUsS0FBYSxHQUFHO1FBQ2xGLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtZQUM5QixNQUFNLEVBQUUsR0FBRyxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDdEUsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUN2QixPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUN2RztpQkFBTTtnQkFDSCxPQUFPLEVBQUUsR0FBRyxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUMxRTtRQUNMLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNJLE1BQU0sQ0FBQyxLQUFLLENBQUMsV0FBbUIsRUFBRSxNQUFjLEdBQUcsRUFBRSxLQUFhLEdBQUc7UUFDeEUsTUFBTSxHQUFHLEdB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