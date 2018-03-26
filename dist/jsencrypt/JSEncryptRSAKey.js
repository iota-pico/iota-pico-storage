Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable */
const hex_1 = require("./lib/asn1js/hex");
const base64_1 = require("./lib/asn1js/base64");
const asn1_1 = require("./lib/asn1js/asn1");
const rsa_1 = require("./lib/jsbn/rsa");
const jsbn_1 = require("./lib/jsbn/jsbn");
/**
 * Create a new JSEncryptRSAKey that extends Tom Wu's RSA key object.
 * This object is just a decorator for parsing the key parameter
 * @param {string|Object} key - The key in string format, or an object containing
 * the parameters needed to build a RSAKey object.
 * @constructor
 */
class JSEncryptRSAKey extends rsa_1.RSAKey {
    constructor(key) {
        super();
        // Call the super constructor.
        //  RSAKey.call(this);
        // If a key key was provided.
        if (key) {
            // If this is a string...
            if (typeof key === "string") {
                this.parseKey(key);
            }
            else if (JSEncryptRSAKey.hasPrivateKeyProperty(key) ||
                JSEncryptRSAKey.hasPublicKeyProperty(key)) {
                // Set the values for the key.
                this.parsePropertiesFrom(key);
            }
        }
    }
    /**
     * Method to parse a pem encoded string containing both a public or private key.
     * The method will translate the pem encoded string in a der encoded string and
     * will parse private key and public key parameters. This method accepts public key
     * in the rsaencryption pkcs #1 format (oid: 1.2.840.113549.1.1.1).
     *
     * @todo Check how many rsa formats use the same format of pkcs #1.
     *
     * The format is defined as:
     * PublicKeyInfo ::= SEQUENCE {
     *   algorithm       AlgorithmIdentifier,
     *   PublicKey       BIT STRING
     * }
     * Where AlgorithmIdentifier is:
     * AlgorithmIdentifier ::= SEQUENCE {
     *   algorithm       OBJECT IDENTIFIER,     the OID of the enc algorithm
     *   parameters      ANY DEFINED BY algorithm OPTIONAL (NULL for PKCS #1)
     * }
     * and PublicKey is a SEQUENCE encapsulated in a BIT STRING
     * RSAPublicKey ::= SEQUENCE {
     *   modulus           INTEGER,  -- n
     *   publicExponent    INTEGER   -- e
     * }
     * it's possible to examine the structure of the keys obtained from openssl using
     * an asn.1 dumper as the one used here to parse the components: http://lapo.it/asn1js/
     * @argument {string} pem the pem encoded string, can include the BEGIN/END header/footer
     * @private
     */
    parseKey(pem) {
        try {
            let modulus = 0;
            let public_exponent = 0;
            const reHex = /^\s*(?:[0-9A-Fa-f][0-9A-Fa-f]\s*)+$/;
            const der = reHex.test(pem) ? hex_1.Hex.decode(pem) : base64_1.Base64.unarmor(pem);
            let asn1 = asn1_1.ASN1.decode(der);
            // Fixes a bug with OpenSSL 1.0+ private keys
            if (asn1.sub.length === 3) {
                asn1 = asn1.sub[2].sub[0];
            }
            if (asn1.sub.length === 9) {
                // Parse the private key.
                modulus = asn1.sub[1].getHexStringValue(); // bigint
                this.n = jsbn_1.parseBigInt(modulus, 16);
                public_exponent = asn1.sub[2].getHexStringValue(); // int
                this.e = parseInt(public_exponent, 16);
                const private_exponent = asn1.sub[3].getHexStringValue(); // bigint
                this.d = jsbn_1.parseBigInt(private_exponent, 16);
                const prime1 = asn1.sub[4].getHexStringValue(); // bigint
                this.p = jsbn_1.parseBigInt(prime1, 16);
                const prime2 = asn1.sub[5].getHexStringValue(); // bigint
                this.q = jsbn_1.parseBigInt(prime2, 16);
                const exponent1 = asn1.sub[6].getHexStringValue(); // bigint
                this.dmp1 = jsbn_1.parseBigInt(exponent1, 16);
                const exponent2 = asn1.sub[7].getHexStringValue(); // bigint
                this.dmq1 = jsbn_1.parseBigInt(exponent2, 16);
                const coefficient = asn1.sub[8].getHexStringValue(); // bigint
                this.coeff = jsbn_1.parseBigInt(coefficient, 16);
            }
            else if (asn1.sub.length === 2) {
                // Parse the public key.
                const bit_string = asn1.sub[1];
                const sequence = bit_string.sub[0];
                modulus = sequence.sub[0].getHexStringValue();
                this.n = jsbn_1.parseBigInt(modulus, 16);
                public_exponent = sequence.sub[1].getHexStringValue();
                this.e = parseInt(public_exponent, 16);
            }
            else {
                return false;
            }
            return true;
        }
        catch (ex) {
            return false;
        }
    }
    // /**
    //  * Translate rsa parameters in a hex encoded string representing the rsa key.
    //  *
    //  * The translation follow the ASN.1 notation :
    //  * RSAPrivateKey ::= SEQUENCE {
    //  *   version           Version,
    //  *   modulus           INTEGER,  -- n
    //  *   publicExponent    INTEGER,  -- e
    //  *   privateExponent   INTEGER,  -- d
    //  *   prime1            INTEGER,  -- p
    //  *   prime2            INTEGER,  -- q
    //  *   exponent1         INTEGER,  -- d mod (p1)
    //  *   exponent2         INTEGER,  -- d mod (q-1)
    //  *   coefficient       INTEGER,  -- (inverse of q) mod p
    //  * }
    //  * @returns {string}  DER Encoded String representing the rsa private key
    //  * @private
    //  */
    // public getPrivateBaseKey() {
    //     const options = {
    //         array: [
    //             new KJUR.asn1.DERInteger({int: 0}),
    //             new KJUR.asn1.DERInteger({bigint: this.n}),
    //             new KJUR.asn1.DERInteger({int: this.e}),
    //             new KJUR.asn1.DERInteger({bigint: this.d}),
    //             new KJUR.asn1.DERInteger({bigint: this.p}),
    //             new KJUR.asn1.DERInteger({bigint: this.q}),
    //             new KJUR.asn1.DERInteger({bigint: this.dmp1}),
    //             new KJUR.asn1.DERInteger({bigint: this.dmq1}),
    //             new KJUR.asn1.DERInteger({bigint: this.coeff})
    //         ]
    //     };
    //     const seq = new KJUR.asn1.DERSequence(options);
    //     return seq.getEncodedHex();
    // }
    // /**
    //  * base64 (pem) encoded version of the DER encoded representation
    //  * @returns {string} pem encoded representation without header and footer
    //  * @public
    //  */
    // public getPrivateBaseKeyB64() {
    //     return hex2b64(this.getPrivateBaseKey());
    // }
    // /**
    //  * Translate rsa parameters in a hex encoded string representing the rsa public key.
    //  * The representation follow the ASN.1 notation :
    //  * PublicKeyInfo ::= SEQUENCE {
    //  *   algorithm       AlgorithmIdentifier,
    //  *   PublicKey       BIT STRING
    //  * }
    //  * Where AlgorithmIdentifier is:
    //  * AlgorithmIdentifier ::= SEQUENCE {
    //  *   algorithm       OBJECT IDENTIFIER,     the OID of the enc algorithm
    //  *   parameters      ANY DEFINED BY algorithm OPTIONAL (NULL for PKCS #1)
    //  * }
    //  * and PublicKey is a SEQUENCE encapsulated in a BIT STRING
    //  * RSAPublicKey ::= SEQUENCE {
    //  *   modulus           INTEGER,  -- n
    //  *   publicExponent    INTEGER   -- e
    //  * }
    //  * @returns {string} DER Encoded String representing the rsa public key
    //  * @private
    //  */
    // public getPublicBaseKey() {
    //     const first_sequence = new KJUR.asn1.DERSequence({
    //         array: [
    //             new KJUR.asn1.DERObjectIdentifier({oid: "1.2.840.113549.1.1.1"}), // RSA Encryption pkcs #1 oid
    //             new KJUR.asn1.DERNull()
    //         ]
    //     });
    //     const second_sequence = new KJUR.asn1.DERSequence({
    //         array: [
    //             new KJUR.asn1.DERInteger({bigint: this.n}),
    //             new KJUR.asn1.DERInteger({int: this.e})
    //         ]
    //     });
    //     const bit_string = new KJUR.asn1.DERBitString({
    //         hex: "00" + second_sequence.getEncodedHex()
    //     });
    //     const seq = new KJUR.asn1.DERSequence({
    //         array: [
    //             first_sequence,
    //             bit_string
    //         ]
    //     });
    //     return seq.getEncodedHex();
    // }
    // /**
    //  * base64 (pem) encoded version of the DER encoded representation
    //  * @returns {string} pem encoded representation without header and footer
    //  * @public
    //  */
    // public getPublicBaseKeyB64() {
    //     return hex2b64(this.getPublicBaseKey());
    // }
    /**
     * wrap the string in block of width chars. The default value for rsa keys is 64
     * characters.
     * @param {string} str the pem encoded string without header and footer
     * @param {Number} [width=64] - the length the string has to be wrapped at
     * @returns {string}
     * @private
     */
    static wordwrap(str, width) {
        width = width || 64;
        if (!str) {
            return str;
        }
        const regex = "(.{1," + width + "})( +|$\n?)|(.{1," + width + "})";
        return str.match(RegExp(regex, "g")).join("\n");
    }
    // /**
    //  * Retrieve the pem encoded private key
    //  * @returns {string} the pem encoded private key with header/footer
    //  * @public
    //  */
    // public getPrivateKey() {
    //     let key = "-----BEGIN RSA PRIVATE KEY-----\n";
    //     key += JSEncryptRSAKey.wordwrap(this.getPrivateBaseKeyB64()) + "\n";
    //     key += "-----END RSA PRIVATE KEY-----";
    //     return key;
    // }
    // /**
    //  * Retrieve the pem encoded public key
    //  * @returns {string} the pem encoded public key with header/footer
    //  * @public
    //  */
    // public getPublicKey() {
    //     let key = "-----BEGIN PUBLIC KEY-----\n";
    //     key += JSEncryptRSAKey.wordwrap(this.getPublicBaseKeyB64()) + "\n";
    //     key += "-----END PUBLIC KEY-----";
    //     return key;
    // }
    /**
     * Check if the object contains the necessary parameters to populate the rsa modulus
     * and public exponent parameters.
     * @param {Object} [obj={}] - An object that may contain the two public key
     * parameters
     * @returns {boolean} true if the object contains both the modulus and the public exponent
     * properties (n and e)
     * @todo check for types of n and e. N should be a parseable bigInt object, E should
     * be a parseable integer number
     * @private
     */
    static hasPublicKeyProperty(obj) {
        obj = obj || {};
        return (obj.hasOwnProperty("n") &&
            obj.hasOwnProperty("e"));
    }
    /**
     * Check if the object contains ALL the parameters of an RSA key.
     * @param {Object} [obj={}] - An object that may contain nine rsa key
     * parameters
     * @returns {boolean} true if the object contains all the parameters needed
     * @todo check for types of the parameters all the parameters but the public exponent
     * should be parseable bigint objects, the public exponent should be a parseable integer number
     * @private
     */
    static hasPrivateKeyProperty(obj) {
        obj = obj || {};
        return (obj.hasOwnProperty("n") &&
            obj.hasOwnProperty("e") &&
            obj.hasOwnProperty("d") &&
            obj.hasOwnProperty("p") &&
            obj.hasOwnProperty("q") &&
            obj.hasOwnProperty("dmp1") &&
            obj.hasOwnProperty("dmq1") &&
            obj.hasOwnProperty("coeff"));
    }
    /**
     * Parse the properties of obj in the current rsa object. Obj should AT LEAST
     * include the modulus and public exponent (n, e) parameters.
     * @param {Object} obj - the object containing rsa parameters
     * @private
     */
    parsePropertiesFrom(obj) {
        this.n = obj.n;
        this.e = obj.e;
        if (obj.hasOwnProperty("d")) {
            this.d = obj.d;
            this.p = obj.p;
            this.q = obj.q;
            this.dmp1 = obj.dmp1;
            this.dmq1 = obj.dmq1;
            this.coeff = obj.coeff;
        }
    }
}
exports.JSEncryptRSAKey = JSEncryptRSAKey;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSlNFbmNyeXB0UlNBS2V5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2pzZW5jcnlwdC9KU0VuY3J5cHRSU0FLZXkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLG9CQUFvQjtBQUNwQiwwQ0FBcUM7QUFDckMsZ0RBQTJDO0FBQzNDLDRDQUF1QztBQUN2Qyx3Q0FBc0M7QUFDdEMsMENBQTRDO0FBRzVDOzs7Ozs7R0FNRztBQUNILHFCQUE2QixTQUFRLFlBQU07SUFDdkMsWUFBWSxHQUFXO1FBQ25CLEtBQUssRUFBRSxDQUFDO1FBQ1IsOEJBQThCO1FBQzlCLHNCQUFzQjtRQUN0Qiw2QkFBNkI7UUFDN0IsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNOLHlCQUF5QjtZQUN6QixFQUFFLENBQUMsQ0FBQyxPQUFPLEdBQUcsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUMxQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3ZCLENBQUM7WUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQ04sZUFBZSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQztnQkFDMUMsZUFBZSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FDNUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ0MsOEJBQThCO2dCQUM5QixJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDbEMsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQTJCRztJQUNJLFFBQVEsQ0FBQyxHQUFVO1FBQ3RCLElBQUksQ0FBQztZQUNELElBQUksT0FBTyxHQUFtQixDQUFDLENBQUM7WUFDaEMsSUFBSSxlQUFlLEdBQW1CLENBQUMsQ0FBQztZQUN4QyxNQUFNLEtBQUssR0FBRyxxQ0FBcUMsQ0FBQztZQUNwRCxNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFD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