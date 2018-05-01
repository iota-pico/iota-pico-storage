import { PlatformCryptoFactory } from "@iota-pico/core/dist/factories/platformCryptoFactory";
import { QueryString } from "../helpers/queryString";
import { IAmazonCredentials } from "../interfaces/IAmazonCredentials";
import { IAmazonRequest } from "../interfaces/IAmazonRequest";

/**
 * Class to help with signing Amazon requests.
 */
export class AmazonRequestSigner {
    /* @internal */
    private readonly _request: IAmazonRequest;

    /* @internal */
    private readonly _credentials: IAmazonCredentials;

    /* @internal */
    private readonly _service: string;
    /* @internal */
    private readonly _region: string;

    /* @internal */
    private _parsedPath: {
        path: string;
        query: { [id: string]: string | string[] };
    };
    /* @internal */
    private _dateTime: string;

    /**
     * Create a new instance of AmazonRequestSigner.
     * @param request The request to be signed.
     * @param credentials The credentials to use for signing.
     */
    constructor(request: IAmazonRequest, credentials: IAmazonCredentials) {
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
    public sign(): IAmazonRequest {
        if (!this._parsedPath) {
            this.prepareRequest();
        }

        if (this._request.signQuery) {
            this._parsedPath.query["X-Amz-Signature"] = this.signature();
        } else {
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
    private matchHost(host: string): string[] {
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
    private isSingleRegion(): boolean {
        // Special case for S3 and SimpleDB in us-east-1
        if (["s3", "sdb"].indexOf(this._service) >= 0 && this._region === "us-east-1") {
            return true;
        }

        return ["cloudfront", "ls", "route53", "iam", "importexport", "sts"]
            .indexOf(this._service) >= 0;
    }

    /* @internal */
    private createHost(): string {
        const region = this.isSingleRegion() ? "" :
            (this._service === "s3" && this._region !== "us-east-1" ? "-" : ".") + this._region;
        const service = this._service === "ses" ? "email" : this._service;
        return `${service}${region}.amazonaws.com`;
    }

    /* @internal */
    private prepareRequest(): void {
        this.parsePath();

        let query: { [id: string]: any };

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
            } else {
                query["X-Amz-Date"] = this.getDateTime();
            }

            query["X-Amz-Algorithm"] = "AWS4-HMAC-SHA256";
            query["X-Amz-Credential"] = `${this._credentials.awsAccessKeyId}/${this.credentialString()}`;
            query["X-Amz-SignedHeaders"] = this.signedHeaders();

        } else {

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
                } else {
                    this._request.headers["X-Amz-Date"] = this.getDateTime();
                }
            }

            delete this._request.headers.Authorization;
            delete this._request.headers.authorization;
        }
    }

    /* @internal */
    private getDateTime(): string {
        if (!this._dateTime) {
            const date = this._request.headers.Date || this._request.headers.date ?
                new Date(this._request.headers.Date || this._request.headers.date) : new Date();

            this._dateTime = date.toISOString().replace(/[:\-]|\.\d{3}/g, "");
        }
        return this._dateTime;
    }

    /* @internal */
    private getDate(): string {
        return this.getDateTime().substr(0, 8);
    }

    /* @internal */
    private authHeader(): string {
        return [
            `AWS4-HMAC-SHA256 Credential=${this._credentials.awsAccessKeyId}/${this.credentialString()}`,
            `SignedHeaders=${this.signedHeaders()}`,
            `Signature=${this.signature()}`
        ].join(", ");
    }

    /* @internal */
    private signature(): string {
        const date = this.getDate();
        const kDate = this.hmac(`AWS4${this._credentials.awsSecretAccessKey}`, date);
        const kRegion = this.hmac(kDate, this._region);
        const kService = this.hmac(kRegion, this._service);
        const kCredentials = this.hmac(kService, "aws4_request");
        return this.hmac(kCredentials, this.stringToSign(), "hex");
    }

    /* @internal */
    private stringToSign(): string {
        return [
            "AWS4-HMAC-SHA256",
            this.getDateTime(),
            this.credentialString(),
            this.hash(this.canonicalString(), "hex")
        ].join("\n");
    }

    /* @internal */
    private canonicalString(): string {
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
        } else {
            bodyHash = headers["X-Amz-Content-Sha256"] || headers["x-amz-content-sha256"] ||
                this.hash(this._request.body || "", "hex");
        }

        if (query) {
            queryStr = this.encodeRfc3986(QueryString.stringify(Object.keys(query)
                .sort()
                .reduce((obj: any, key) => {
                    if (!key) {
                        return obj;
                    }
                    obj[key] = !Array.isArray(query[key]) ? query[key] :
                        (firstValOnly ? query[key][0] : (<string[]>query[key]).slice().sort());
                    return obj;
                },
                        {})));
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
                    } else if (!normalizePath || piece !== ".") {
                        let localPiece = piece;
                        if (decodePath) {
                            localPiece = decodeURIComponent(localPiece);
                        }
                        path.push(this.encodeRfc3986(encodeURIComponent(localPiece)));
                    }
                    return path;
                },
                        []).join("/");
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
    private trimAll(header: string): string {
        return header.toString().trim().replace(/\s+/g, " ");
    }

    /* @internal */
    private canonicalHeaders(): string {
        const headers = this._request.headers;

        return Object.keys(headers)
            .sort((a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : 1)
            .map((key) => `${key.toLowerCase()}:${this.trimAll(headers[key])}`)
            .join("\n");
    }

    /* @internal */
    private signedHeaders(): string {
        return Object.keys(this._request.headers)
            .map((key) => key.toLowerCase())
            .sort()
            .join(";");
    }

    /* @internal */
    private credentialString(): string {
        return [
            this.getDate(),
            this._region,
            this._service,
            "aws4_request"
        ].join("/");
    }

    /* @internal */
    private parsePath(): void {
        let path = this._request.path || "/";
        const queryIx = path.indexOf("?");
        let query = null;

        if (queryIx >= 0) {
            query = QueryString.parse(path.slice(queryIx + 1));
            path = path.slice(0, queryIx);
        }

        // S3 doesn't always encode characters > 127 correctly and
        // all services don't encode characters > 255 correctly
        // So if there are non-reserved chars (and it's not already all % encoded), just encode them all
        if (/[^0-9A-Za-z!'()*\-._~%/]/.test(path)) {
            path = path.split("/").map((piece) =>
                encodeURIComponent(decodeURIComponent(piece))).join("/");
        }

        this._parsedPath = {
            path: path,
            query: query
        };
    }

    /* @internal */
    private formatPath(): string {
        const path = this._parsedPath.path;
        const query = this._parsedPath.query;

        if (!query) {
            return path;
        }

        // Services don't support empty query string keys
        if (query[""] != null) { delete query[""]; }

        return `${path}?${this.encodeRfc3986(QueryString.stringify(query))}`;
    }

    /* @internal */
    private hmac(key: string, data: string, encoding?: "latin1" | "hex" | "base64"): any {
        const crypto = PlatformCryptoFactory.instance().create("default");
        return crypto.hmac("sha256", key, data, "utf8", encoding);
    }

    /* @internal */
    private hash(data: string, encoding: "latin1" | "hex" | "base64"): any {
        const crypto = PlatformCryptoFactory.instance().create("default");
        return crypto.hash("sha256", data, "utf8", encoding);
    }

    /* @internal */
    private encodeRfc3986(urlEncodedString: string): string {
        return urlEncodedString.replace(/[!'()*]/g, (c) =>
            `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
    }
}
