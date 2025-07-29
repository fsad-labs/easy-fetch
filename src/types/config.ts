import { IRequestOptions } from "./request";

export interface IEasyFetchOptions {
    baseUrl?: string;
    headers?: Record<string,string>;
    timeout?: number;
    token?: string;
}

export interface IRequestConfig extends IRequestOptions {
    url: string;
    method: string,
}
