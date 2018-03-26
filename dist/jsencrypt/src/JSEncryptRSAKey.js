Object.defineProperty(exports, "__esModule", { value: true });
const base64_1 = require("../lib/jsbn/base64");
const hex_1 = require("../lib/asn1js/hex");
const base64_2 = require("../lib/asn1js/base64");
const asn1_1 = require("../lib/asn1js/asn1");
const rsa_1 = require("../lib/jsbn/rsa");
const jsbn_1 = require("../lib/jsbn/jsbn");
const asn1_1_0_1 = require("../lib/jsrsasign/asn1-1.0");
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
            const der = reHex.test(pem) ? hex_1.Hex.decode(pem) : base64_2.Base64.unarmor(pem);
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
    /**
     * Translate rsa parameters in a hex encoded string representing the rsa key.
     *
     * The translation follow the ASN.1 notation :
     * RSAPrivateKey ::= SEQUENCE {
     *   version           Version,
     *   modulus           INTEGER,  -- n
     *   publicExponent    INTEGER,  -- e
     *   privateExponent   INTEGER,  -- d
     *   prime1            INTEGER,  -- p
     *   prime2            INTEGER,  -- q
     *   exponent1         INTEGER,  -- d mod (p1)
     *   exponent2         INTEGER,  -- d mod (q-1)
     *   coefficient       INTEGER,  -- (inverse of q) mod p
     * }
     * @returns {string}  DER Encoded String representing the rsa private key
     * @private
     */
    getPrivateBaseKey() {
        const options = {
            array: [
                new asn1_1_0_1.KJUR.asn1.DERInteger({ int: 0 }),
                new asn1_1_0_1.KJUR.asn1.DERInteger({ bigint: this.n }),
                new asn1_1_0_1.KJUR.asn1.DERInteger({ int: this.e }),
                new asn1_1_0_1.KJUR.asn1.DERInteger({ bigint: this.d }),
                new asn1_1_0_1.KJUR.asn1.DERInteger({ bigint: this.p }),
                new asn1_1_0_1.KJUR.asn1.DERInteger({ bigint: this.q }),
                new asn1_1_0_1.KJUR.asn1.DERInteger({ bigint: this.dmp1 }),
                new asn1_1_0_1.KJUR.asn1.DERInteger({ bigint: this.dmq1 }),
                new asn1_1_0_1.KJUR.asn1.DERInteger({ bigint: this.coeff })
            ]
        };
        const seq = new asn1_1_0_1.KJUR.asn1.DERSequence(options);
        return seq.getEncodedHex();
    }
    /**
     * base64 (pem) encoded version of the DER encoded representation
     * @returns {string} pem encoded representation without header and footer
     * @public
     */
    getPrivateBaseKeyB64() {
        return base64_1.hex2b64(this.getPrivateBaseKey());
    }
    /**
     * Translate rsa parameters in a hex encoded string representing the rsa public key.
     * The representation follow the ASN.1 notation :
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
     * @returns {string} DER Encoded String representing the rsa public key
     * @private
     */
    getPublicBaseKey() {
        const first_sequence = new asn1_1_0_1.KJUR.asn1.DERSequence({
            array: [
                new asn1_1_0_1.KJUR.asn1.DERObjectIdentifier({ oid: "1.2.840.113549.1.1.1" }),
                new asn1_1_0_1.KJUR.asn1.DERNull()
            ]
        });
        const second_sequence = new asn1_1_0_1.KJUR.asn1.DERSequence({
            array: [
                new asn1_1_0_1.KJUR.asn1.DERInteger({ bigint: this.n }),
                new asn1_1_0_1.KJUR.asn1.DERInteger({ int: this.e })
            ]
        });
        const bit_string = new asn1_1_0_1.KJUR.asn1.DERBitString({
            hex: "00" + second_sequence.getEncodedHex()
        });
        const seq = new asn1_1_0_1.KJUR.asn1.DERSequence({
            array: [
                first_sequence,
                bit_string
            ]
        });
        return seq.getEncodedHex();
    }
    /**
     * base64 (pem) encoded version of the DER encoded representation
     * @returns {string} pem encoded representation without header and footer
     * @public
     */
    getPublicBaseKeyB64() {
        return base64_1.hex2b64(this.getPublicBaseKey());
    }
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
    /**
     * Retrieve the pem encoded private key
     * @returns {string} the pem encoded private key with header/footer
     * @public
     */
    getPrivateKey() {
        let key = "-----BEGIN RSA PRIVATE KEY-----\n";
        key += JSEncryptRSAKey.wordwrap(this.getPrivateBaseKeyB64()) + "\n";
        key += "-----END RSA PRIVATE KEY-----";
        return key;
    }
    /**
     * Retrieve the pem encoded public key
     * @returns {string} the pem encoded public key with header/footer
     * @public
     */
    getPublicKey() {
        let key = "-----BEGIN PUBLIC KEY-----\n";
        key += JSEncryptRSAKey.wordwrap(this.getPublicBaseKeyB64()) + "\n";
        key += "-----END PUBLIC KEY-----";
        return key;
    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSlNFbmNyeXB0UlNBS2V5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2pzZW5jcnlwdC9zcmMvSlNFbmNyeXB0UlNBS2V5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSwrQ0FBMkM7QUFDM0MsMkNBQXNDO0FBQ3RDLGlEQUE0QztBQUM1Qyw2Q0FBd0M7QUFDeEMseUNBQXVDO0FBQ3ZDLDJDQUE2QztBQUM3Qyx3REFBK0M7QUFHL0M7Ozs7OztHQU1HO0FBQ0gscUJBQTZCLFNBQVEsWUFBTTtJQUN2QyxZQUFZLEdBQVc7UUFDbkIsS0FBSyxFQUFFLENBQUM7UUFDUiw4QkFBOEI7UUFDOUIsc0JBQXNCO1FBQ3RCLDZCQUE2QjtRQUM3QixFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ04seUJBQXlCO1lBQ3pCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sR0FBRyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQzFCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDdkIsQ0FBQztZQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FDTixlQUFlLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDO2dCQUMxQyxlQUFlLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUM1QyxDQUFDLENBQUMsQ0FBQztnQkFDQyw4QkFBOEI7Z0JBQzlCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNsQyxDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7SUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BMkJHO0lBQ0ksUUFBUSxDQUFDLEdBQVU7UUFDdEIsSUFBSSxDQUFDO1lBQ0QsSUFBSSxPQUFPLEdBQW1CLENBQUMsQ0FBQztZQUNoQyxJQUFJLGVBQWUsR0FBbUIsQ0FBQyxDQUFDO1lBQ3hDLE1BQU0sS0FBSyxHQUFHLHFDQUFxQyxDQUFDO1lBQ3BELE1BQU0sR0FBRyxHQUFH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