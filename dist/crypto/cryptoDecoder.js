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
 * Cryptor can perform decryption operations.
 */
class CryptoDecoder {
    /**
     * Create a new instance of Cryptor.
     * @param publicKey The key to use for decoding data.
     */
    constructor(publicKey) {
        if (stringHelper_1.StringHelper.isEmpty(publicKey)) {
            throw new storageError_1.StorageError("The publicKey must be a non empty string");
        }
        this._publicKey = publicKey;
    }
    /**
     * Decrypt the given data.
     * @param data The data to decrypt.
     * @returns The decrypted data.
     */
    decrypt(data) {
        if (stringHelper_1.StringHelper.isEmpty(data)) {
            throw new storageError_1.StorageError("The data must be a non empty string");
        }
        const buffer = new Buffer(data, "hex");
        const decrypted = crypto.publicDecrypt(this._publicKey, buffer);
        return decrypted.toString("ascii");
    }
}
exports.CryptoDecoder = CryptoDecoder;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3J5cHRvRGVjb2Rlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jcnlwdG8vY3J5cHRvRGVjb2Rlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBLDRFQUF5RTtBQUN6RSwrQ0FBaUM7QUFDakMsd0RBQXFEO0FBR3JEOztHQUVHO0FBQ0g7SUFJSTs7O09BR0c7SUFDSCxZQUFZLFNBQWlCO1FBQ3pCLEVBQUUsQ0FBQyxDQUFDLDJCQUFZLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsQyxNQUFNLElBQUksMkJBQVksQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQ3ZFLENBQUM7UUFDRCxJQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztJQUNoQyxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNJLE9BQU8sQ0FBQyxJQUFZO1FBQ3ZCLEVBQUUsQ0FBQyxDQUFDLDJCQUFZLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3QixNQUFNLElBQUksMkJBQVksQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO1FBQ2xFLENBQUM7UUFDRCxNQUFNLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDdkMsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ2hFLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7Q0FDSjtBQTVCRCxzQ0E0QkMifQ==