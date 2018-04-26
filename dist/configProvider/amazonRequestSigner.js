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
                // if (request.body && !headers['Content-Length'] && !headers['content-length'])
                //     headers['Content-Length'] = Buffer.byteLength(request.body)
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