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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnlTdHJpbmcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaGVscGVycy9xdWVyeVN0cmluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsNEVBQXlFO0FBRXpFOztHQUVHO0FBQ0gsTUFBYSxXQUFXO0lBQ3BCOzs7Ozs7T0FNRztJQUNJLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBeUIsRUFBRSxNQUFjLEdBQUcsRUFBRSxLQUFhLEdBQUc7UUFDbEYsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO1lBQzlCLE1BQU0sRUFBRSxHQUFHLGtCQUFrQixDQUFDLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUN0RSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3ZCLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQU0sRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLGtCQUFrQixDQUFDLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ3ZHO2lCQUFNO2dCQUNILE9BQU8sRUFBRSxHQUFHLGtCQUFrQixDQUFDLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQzFFO1FBQ0wsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNqQyxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0ksTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFtQixFQUFFLE1BQWMsR0FBRyxFQUFFLEtBQWEsR0FBRztRQUN4RSxN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