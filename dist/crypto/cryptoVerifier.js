var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
}
Object.defineProperty(exports, "__esModule", { value: true });
const stringHelper_1 = require("@iota-pico/core/dist/helpers/stringHelper");
const crypto = __importStar(require("crypto"));
const storageError_1 = require("../error/storageError");
/**
 * CryptoVerifier can perform verification operations.
 */
class CryptoVerifier {
    /**
     * Create a new instance of CryptoVerifier.
     * @param publicKey The key to use for decoding messages.
     */
    constructor(publicKey) {
        if (stringHelper_1.StringHelper.isEmpty(publicKey)) {
            throw new storageError_1.StorageError("The publicKey must be a non empty string");
        }
        this._publicKey = publicKey;
    }
    /**
     * Verify the given data.
     * @param data The data to verify.
     * @param signature The signature to verify againt the data.
     * @returns True if the verification is successful.
     */
    verify(data, signature) {
        if (stringHelper_1.StringHelper.isEmpty(data)) {
            throw new storageError_1.StorageError("The data must be a non empty string");
        }
        if (stringHelper_1.StringHelper.isEmpty(signature)) {
            throw new storageError_1.StorageError("The signature must be a non empty string");
        }
        const verifier = crypto.createVerify("RSA-SHA256");
        verifier.update(data);
        return verifier.verify(this._publicKey, signature, "hex");
    }
}
exports.CryptoVerifier = CryptoVerifier;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3J5cHRvVmVyaWZpZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY3J5cHRvL2NyeXB0b1ZlcmlmaWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUEsNEVBQXlFO0FBQ3pFLCtDQUFpQztBQUNqQyx3REFBcUQ7QUFHckQ7O0dBRUc7QUFDSDtJQUlJOzs7T0FHRztJQUNILFlBQVksU0FBaUI7UUFDekIsRUFBRSxDQUFDLENBQUMsMkJBQVksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xDLE1BQU0sSUFBSSwyQkFBWSxDQUFDLDBDQUEwQyxDQUFDLENBQUM7UUFDdkUsQ0FBQztRQUNELElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO0lBQ2hDLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNJLE1BQU0sQ0FBQyxJQUFZLEVBQUUsU0FBaUI7UUFDekMsRUFBRSxDQUFDLENBQUMsMkJBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdCLE1BQU0sSUFBSSwyQkFBWSxDQUFDLHFDQUFxQyxDQUFDLENBQUM7UUFDbEUsQ0FBQztRQUNELEVBQUUsQ0FBQyxDQUFDLDJCQUFZLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsQyxNQUFNLElBQUksMkJBQVksQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQ3ZFLENBQUM7UUFDRCxNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ25ELFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDOUQsQ0FBQztDQUNKO0FBaENELHdDQWdDQyJ9