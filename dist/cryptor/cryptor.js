var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
}
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = __importStar(require("crypto"));
//import { JSEncrypt } from "../jsencrypt/JSEncrypt";
/**
 * Cryptor can perform encryption/decryption operations.
 */
class Cryptor {
    /**
     * Create a new instance of Cryptor.
     * @param publicKey The key to use for decoding messages.
     * @param privateKey The key to use for encoding messages.
     */
    constructor(publicKey, privateKey) {
        this._publicKey = publicKey;
        this._privateKey = privateKey;
    }
    /**
     * Encrypt the given data.
     * @param data The data to encrypt.
     * @return The encrypted data.
     */
    encrypt(data) {
        // const jsencrypt = new JSEncrypt({});
        // jsencrypt.setPrivateKey(this._privateKey);
        // const res = jsencrypt.encrypt(data);
        // return res === false ? undefined : res;
        const buffer = new Buffer(data, "ascii");
        const encrypted = crypto.privateEncrypt(this._privateKey, buffer);
        return encrypted.toString("hex");
    }
    /**
     * Decrypt the given data.
     * @param data The data to decrypt.
     * @return The decrypted data.
     */
    decrypt(data) {
        // const jsencrypt = new JSEncrypt({});
        // jsencrypt.setPublicKey(this._publicKey);
        // const res = jsencrypt.decrypt(data);
        // return res === false ? undefined : res;
        const buffer = new Buffer(data, "hex");
        const decrypted = crypto.publicDecrypt(this._publicKey, buffer);
        return decrypted.toString("ascii");
    }
}
exports.Cryptor = Cryptor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3J5cHRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jcnlwdG9yL2NyeXB0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQSwrQ0FBaUM7QUFFakMscURBQXFEO0FBRXJEOztHQUVHO0FBQ0g7SUFPSTs7OztPQUlHO0lBQ0gsWUFBWSxTQUFpQixFQUFFLFVBQWtCO1FBQzdDLElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO1FBQzVCLElBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO0lBQ2xDLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksT0FBTyxDQUFDLElBQVk7UUFDdkIsdUNBQXVDO1FBQ3ZDLDZDQUE2QztRQUM3Qyx1Q0FBdUM7UUFDdkMsMENBQTBDO1FBRTFDLE1BQU0sTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUN6QyxNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDbEUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxPQUFPLENBQUMsSUFBWTtRQUN2Qix1Q0FBdUM7UUFDdkMsMkNBQTJDO1FBQzNDLHVDQUF1QztRQUN2QywwQ0FBMEM7UUFFMUMsTUFBTSxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3ZDLE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNoRSxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN2QyxDQUFDO0NBQ0o7QUFoREQsMEJBZ0RDIn0=