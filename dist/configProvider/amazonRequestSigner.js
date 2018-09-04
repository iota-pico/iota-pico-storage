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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW1hem9uUmVxdWVzdFNpZ25lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb25maWdQcm92aWRlci9hbWF6b25SZXF1ZXN0U2lnbmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxnR0FBNkY7QUFDN0Ysd0RBQXFEO0FBSXJEOztHQUVHO0FBQ0gsTUFBYSxtQkFBbUI7SUFvQjVCOzs7O09BSUc7SUFDSCxZQUFZLE9BQXVCLEVBQUUsV0FBK0I7UUFDaEUsT0FBTyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQztRQUN4QyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUUvRixJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztRQUN4QixJQUFJLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQztRQUVoQyxJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxPQUFPLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN0RCxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxNQUFNLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLFdBQVcsQ0FBQztRQUU3RCxvREFBb0Q7UUFDcEQsSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLE9BQU8sRUFBRTtZQUMzQixJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztTQUN6QjtRQUVELElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxJQUFJLE9BQU8sQ0FBQyxJQUFJLEVBQUU7WUFDakMsT0FBTyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7U0FDM0I7UUFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksQ0FB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