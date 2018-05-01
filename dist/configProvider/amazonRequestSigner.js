Object.defineProperty(exports, "__esModule", { value: true });
const platformCryptoFactory_1 = require("@iota-pico/core/dist/factories/platformCryptoFactory");
const queryString_1 = require("../helpers/queryString");
/**
 * Class to help with signing Amazon requests.
 */
class AmazonRequestSigner {
    /**
     * Create a new instance of AmazonRequestSigner.
     * @param request The request to be signed.
     * @param credentials The credentials to use for signing.
     */
    constructor(request, credentials) {
        request.headers = request.headers || {};
        const hostParts = this.matchHost(request.host || request.headers.Host || request.headers.host);
        this._request = request;
        this._credentials = credentials;
        this._service = request.service || hostParts[0] || "";
        this._region = request.region || hostParts[1] || "us-east-1";
        // SES uses a different domain from the service name
        if (this._service === "email") {
            this._service = "ses";
        }
        if (!request.method && request.body) {
            request.method = "POST";
        }
        if (!request.headers.Host && !request.headers.host) {
            request.headers.Host = request.hostname || request.host || this.createHost();
            if (request.port) {
                request.headers.Host += `:${request.port}`;
            }
        }
        if (!request.hostname && !request.host) {
            request.hostname = request.headers.Host || request.headers.host;
        }
    }
    /**
     * Signed the request.
     * @returns The signed request.
     */
    sign() {
        if (!this._parsedPath) {
            this.prepareRequest();
        }
        if (this._request.signQuery) {
            this._parsedPath.query["X-Amz-Signature"] = this.signature();
        }
        else {
            this._request.headers.Authorization = this.authHeader();
        }
        this._request.path = this.formatPath();
        // Remove unsafe headers to avoid browser errors
        delete this._request.headers.host;
        delete this._request.headers.Host;
        delete this._request.headers["Content-Length"];
        return this._request;
    }
    /* @internal */
    matchHost(host) {
        const match = (host || "").match(/([^\.]+)\.(?:([^\.]*)\.)?amazonaws\.com$/);
        let hostParts = (match || []).slice(1, 3);
        // ES's hostParts are sometimes the other way round, if the value that is expected
        // to be region equals ‘es’ switch them back
        // e.g. search-cluster-name-aaaa00aaaa0aaa0aaaaaaa0aaa.us-east-1.es.amazonaws.com
        if (hostParts[1] === "es") {
            hostParts = hostParts.reverse();
        }
        return hostParts;
    }
    /* @internal */
    isSingleRegion() {
        // Special case for S3 and SimpleDB in us-east-1
        if (["s3", "sdb"].indexOf(this._service) >= 0 && this._region === "us-east-1") {
            return true;
        }
        return ["cloudfront", "ls", "route53", "iam", "importexport", "sts"]
            .indexOf(this._service) >= 0;
    }
    /* @internal */
    createHost() {
        const region = this.isSingleRegion() ? "" :
            (this._service === "s3" && this._region !== "us-east-1" ? "-" : ".") + this._region;
        const service = this._service === "ses" ? "email" : this._service;
        return `${service}${region}.amazonaws.com`;
    }
    /* @internal */
    prepareRequest() {
        this.parsePath();
        let query;
        if (this._request.signQuery) {
            this._parsedPath.query = query = this._parsedPath.query || {};
            if (this._credentials.sessionToken) {
                query["X-Amz-Security-Token"] = this._credentials.sessionToken;
            }
            if (this._service === "s3" && !query["X-Amz-Expires"]) {
                query["X-Amz-Expires"] = 86400;
            }
            if (query["X-Amz-Date"]) {
                this._dateTime = query["X-Amz-Date"];
            }
            else {
                query["X-Amz-Date"] = this.getDateTime();
            }
            query["X-Amz-Algorithm"] = "AWS4-HMAC-SHA256";
            query["X-Amz-Credential"] = `${this._credentials.awsAccessKeyId}/${this.credentialString()}`;
            query["X-Amz-SignedHeaders"] = this.signedHeaders();
        }
        else {
            if (!this._request.doNotModifyHeaders) {
                if (this._request.body && !this._request.headers["Content-Type"] && !this._request.headers["content-type"]) {
                    this._request.headers["Content-Type"] = "application/x-www-form-urlencoded; charset=utf-8";
                }
                if (this._credentials.sessionToken && !this._request.headers["X-Amz-Security-Token"] && !this._request.headers["x-amz-security-token"]) {
                    this._request.headers["X-Amz-Security-Token"] = this._credentials.sessionToken;
                }
                if (this._service === "s3" && !this._request.headers["X-Amz-Content-Sha256"] && !this._request.headers["x-amz-content-sha256"]) {
                    this._request.headers["X-Amz-Content-Sha256"] = this.hash(this._request.body || "", "hex");
                }
                if (this._request.headers["X-Amz-Date"] || this._request.headers["x-amz-date"]) {
                    this._dateTime = this._request.headers["X-Amz-Date"] || this._request.headers["x-amz-date"];
                }
                else {
                    this._request.headers["X-Amz-Date"] = this.getDateTime();
                }
            }
            delete this._request.headers.Authorization;
            delete this._request.headers.authorization;
        }
    }
    /* @internal */
    getDateTime() {
        if (!this._dateTime) {
            const date = this._request.headers.Date || this._request.headers.date ?
                new Date(this._request.headers.Date || this._request.headers.date) : new Date();
            this._dateTime = date.toISOString().replace(/[:\-]|\.\d{3}/g, "");
        }
        return this._dateTime;
    }
    /* @internal */
    getDate() {
        return this.getDateTime().substr(0, 8);
    }
    /* @internal */
    authHeader() {
        return [
            `AWS4-HMAC-SHA256 Credential=${this._credentials.awsAccessKeyId}/${this.credentialString()}`,
            `SignedHeaders=${this.signedHeaders()}`,
            `Signature=${this.signature()}`
        ].join(", ");
    }
    /* @internal */
    signature() {
        const date = this.getDate();
        const kDate = this.hmac(`AWS4${this._credentials.awsSecretAccessKey}`, date);
        const kRegion = this.hmac(kDate, this._region);
        const kService = this.hmac(kRegion, this._service);
        const kCredentials = this.hmac(kService, "aws4_request");
        return this.hmac(kCredentials, this.stringToSign(), "hex");
    }
    /* @internal */
    stringToSign() {
        return [
            "AWS4-HMAC-SHA256",
            this.getDateTime(),
            this.credentialString(),
            this.hash(this.canonicalString(), "hex")
        ].join("\n");
    }
    /* @internal */
    canonicalString() {
        if (!this._parsedPath) {
            this.prepareRequest();
        }
        let pathStr = this._parsedPath.path;
        const query = this._parsedPath.query;
        const headers = this._request.headers;
        let queryStr = "";
        const normalizePath = this._service !== "s3";
        const decodePath = this._service === "s3" || this._request.doNotEncodePath;
        const decodeSlashesInPath = this._service === "s3";
        const firstValOnly = this._service === "s3";
        let bodyHash;
        if (this._service === "s3" && this._request.signQuery) {
            bodyHash = "UNSIGNED-PAYLOAD";
        }
        else {
            bodyHash = headers["X-Amz-Content-Sha256"] || headers["x-amz-content-sha256"] ||
                this.hash(this._request.body || "", "hex");
        }
        if (query) {
            queryStr = this.encodeRfc3986(queryString_1.QueryString.stringify(Object.keys(query)
                .sort()
                .reduce((obj, key) => {
                if (!key) {
                    return obj;
                }
                obj[key] = !Array.isArray(query[key]) ? query[key] :
                    (firstValOnly ? query[key][0] : query[key].slice().sort());
                return obj;
            }, {})));
        }
        if (pathStr !== "/") {
            if (normalizePath) {
                pathStr = pathStr.replace(/\/{2,}/g, "/");
            }
            pathStr = pathStr
                .split("/")
                .reduce((path, piece) => {
                if (normalizePath && piece === "..") {
                    path.pop();
                }
                else if (!normalizePath || piece !== ".") {
                    let localPiece = piece;
                    if (decodePath) {
                        localPiece = decodeURIComponent(localPiece);
                    }
                    path.push(this.encodeRfc3986(encodeURIComponent(localPiece)));
                }
                return path;
            }, []).join("/");
            if (pathStr[0] !== "/") {
                pathStr = `/${pathStr}`;
            }
            if (decodeSlashesInPath) {
                pathStr = pathStr.replace(/%2F/g, "/");
            }
        }
        return [
            this._request.method || "GET",
            pathStr,
            queryStr,
            `${this.canonicalHeaders()}\n`,
            this.signedHeaders(),
            bodyHash
        ].join("\n");
    }
    /* @internal */
    trimAll(header) {
        return header.toString().trim().replace(/\s+/g, " ");
    }
    /* @internal */
    canonicalHeaders() {
        const headers = this._request.headers;
        return Object.keys(headers)
            .sort((a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : 1)
            .map((key) => `${key.toLowerCase()}:${this.trimAll(headers[key])}`)
            .join("\n");
    }
    /* @internal */
    signedHeaders() {
        return Object.keys(this._request.headers)
            .map((key) => key.toLowerCase())
            .sort()
            .join(";");
    }
    /* @internal */
    credentialString() {
        return [
            this.getDate(),
            this._region,
            this._service,
            "aws4_request"
        ].join("/");
    }
    /* @internal */
    parsePath() {
        let path = this._request.path || "/";
        const queryIx = path.indexOf("?");
        let query = null;
        if (queryIx >= 0) {
            query = queryString_1.QueryString.parse(path.slice(queryIx + 1));
            path = path.slice(0, queryIx);
        }
        // S3 doesn't always encode characters > 127 correctly and
        // all services don't encode characters > 255 correctly
        // So if there are non-reserved chars (and it's not already all % encoded), just encode them all
        if (/[^0-9A-Za-z!'()*\-._~%/]/.test(path)) {
            path = path.split("/").map((piece) => encodeURIComponent(decodeURIComponent(piece))).join("/");
        }
        this._parsedPath = {
            path: path,
            query: query
        };
    }
    /* @internal */
    formatPath() {
        const path = this._parsedPath.path;
        const query = this._parsedPath.query;
        if (!query) {
            return path;
        }
        // Services don't support empty query string keys
        if (query[""] != null) {
            delete query[""];
        }
        return `${path}?${this.encodeRfc3986(queryString_1.QueryString.stringify(query))}`;
    }
    /* @internal */
    hmac(key, data, encoding) {
        const crypto = platformCryptoFactory_1.PlatformCryptoFactory.instance().create("default");
        return crypto.hmac("sha256", key, data, "utf8", encoding);
    }
    /* @internal */
    hash(data, encoding) {
        const crypto = platformCryptoFactory_1.PlatformCryptoFactory.instance().create("default");
        return crypto.hash("sha256", data, "utf8", encoding);
    }
    /* @internal */
    encodeRfc3986(urlEncodedString) {
        return urlEncodedString.replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
    }
}
exports.AmazonRequestSigner = AmazonRequestSigner;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW1hem9uUmVxdWVzdFNpZ25lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb25maWdQcm92aWRlci9hbWF6b25SZXF1ZXN0U2lnbmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxnR0FBNkY7QUFDN0Ysd0RBQXFEO0FBSXJEOztHQUVHO0FBQ0g7SUFvQkk7Ozs7T0FJRztJQUNILFlBQVksT0FBdUIsRUFBRSxXQUErQjtRQUNoRSxPQUFPLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDO1FBQ3hDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRS9GLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDO1FBRWhDLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLE9BQU8sSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3RELElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLE1BQU0sSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksV0FBVyxDQUFDO1FBRTdELG9EQUFvRDtRQUNwRCxJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssT0FBTyxFQUFFO1lBQzNCLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO1NBQ3pCO1FBRUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFDLElBQUksRUFBRTtZQUNqQyxPQUFPLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztTQUMzQjtRQUVELElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxP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