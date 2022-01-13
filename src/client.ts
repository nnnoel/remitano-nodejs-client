import crypto from "crypto";
import axios, { AxiosRequestConfig, AxiosRequestHeaders } from "axios";
import { isObject } from "./helpers";

class RemitanoClientError extends Error {}

export interface RemitanoClientOptions {
  baseURL?: string;
  accessKey: string;
  secretKey: string;
}

export interface RemitanoRequestConfig extends AxiosRequestConfig {
  url: string;
  headers?: RemitanoRequestHeaders;
}

export interface RemitanoRequestHeaders extends AxiosRequestHeaders {
  "Content-Type": string;
  "Content-MD5": string;
  date: string;
  Authorization: string;
}

export type RemitanoRequestData = string | Record<string, any>;

class RemitanoClient {
  private BASE_URL;
  private ACCESS_KEY;
  private SECRET_KEY;

  constructor({
    baseURL = "https://api.remitano.com",
    accessKey,
    secretKey,
  }: RemitanoClientOptions) {
    if (!accessKey) throw new RemitanoClientError("Missing accessKey");
    if (!secretKey) throw new RemitanoClientError("Missing secretKey");
    this.BASE_URL = baseURL;
    this.ACCESS_KEY = accessKey;
    this.SECRET_KEY = secretKey;
  }

  private computeHmac(
    secret: string,
    method: string = "sha256",
    data: RemitanoRequestData
  ) {
    const hmac = crypto.createHmac(method, secret);
    hmac.update(typeof data === "string" ? data : JSON.stringify(data));
    return Buffer.from(hmac.digest()).toString("base64");
  }

  private computeMD5(data: RemitanoRequestData = "") {
    const md5 = crypto.createHash("md5");
    md5.update(typeof data === "string" ? data : JSON.stringify(data));
    return Buffer.from(md5.digest()).toString("base64");
  }

  private generateApiAuthHeader({
    method,
    contentTypeHeader,
    contentMd5Header,
    url,
    utcDateStringHeader,
  }: {
    method: string;
    contentTypeHeader: string;
    contentMd5Header: string;
    url: string;
    utcDateStringHeader: string;
  }) {
    const requestString = `${method},${contentTypeHeader},${contentMd5Header},${url},${utcDateStringHeader}`;
    const sig = this.computeHmac(this.SECRET_KEY, "sha1", requestString);
    return `APIAuth ${this.ACCESS_KEY}:${sig}`;
  }

  request(config: RemitanoRequestConfig) {
    if (!isObject(config))
      throw new RemitanoClientError("Missing required request config");
    if (!config.url) throw new RemitanoClientError("Missing config url");

    const contentTypeHeader = "application/json";
    const contentMd5Header = this.computeMD5(config.data ?? "");
    const utcDateStringHeader = new Date().toUTCString();

    const authorizationHeader = this.generateApiAuthHeader({
      url: config.url,
      method: config.method?.toUpperCase?.() || "GET",
      contentTypeHeader,
      contentMd5Header,
      utcDateStringHeader,
    });

    const axiosRequestConfig: RemitanoRequestConfig = {
      ...config,
      baseURL: this.BASE_URL,
      headers: {
        ...config.headers,
        "Content-Type": contentTypeHeader,
        "Content-MD5": contentMd5Header,
        date: utcDateStringHeader,
        Authorization: authorizationHeader,
      } as RemitanoRequestHeaders,
    };
    return axios.request(axiosRequestConfig);
  }
}

export default RemitanoClient;
