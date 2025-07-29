import { IEasyFetchOptions, IInterceptors, IRequestConfig, IResponse } from "./types";
import { retryRequest } from "./utils";
import { buildUrl } from './utils/build-url';

export class EasyFetch {

    private baseUrl: string;
    private httpHeaders?: Record<string, string>;
    private timeout?: number;
    private token?: string;

    public interceptors?: IInterceptors;

    constructor(options: IEasyFetchOptions = {}, interceptors?: IInterceptors) {
        this.baseUrl = options.baseUrl ?? '';
        this.httpHeaders = options.headers;
        this.timeout = options.timeout ?? 0;
        this.token = options.token;
        this.interceptors = interceptors;
    }


    async request<T = any>(config: IRequestConfig): Promise<IResponse<T>> {
        // base url
        config.url = this.baseUrl + config.url;

        // headers
        if (this.token) {
            console.log("Adding token", this.token);

            this.httpHeaders = {
                "Authorization": `Bearer ${this.token}`,
                ...this.httpHeaders
            };
        }

        console.log("this.httpHeaders", this.httpHeaders);


        if (!config.headers) {
            config.headers = new Headers({ "Content-Type": "application/json" });
        }

        if (this.httpHeaders) {
            Object.entries(this.httpHeaders).forEach(([key, value]) => {
                config.headers?.append(key, value);
            })
        }


        console.log("config.headers", config.headers);

        // add request interceptors
        if (this.interceptors) {
            for (const interceptor of this.interceptors?.request?.handlers ?? []) {
                config = await interceptor(config);
            }
        }

        // build url with parameters 
        const finalUrl = buildUrl(config.url, config.params);

        // setup timeout and signal
        const controller = new AbortController();
        const timeoutId = config.timeout ?? this.timeout ? setTimeout(() => controller.abort(), config.timeout ?? this.timeout) : null;

        // fetching
        const response = await retryRequest(() => fetch(finalUrl, {
            method: config.method,
            headers: config.headers,
            body: this.prepareBody(config),
            signal: config.signal ?? controller.signal
        }), config.retries, config.retryDelay).then(async res => {
            if (this.interceptors) {
                for (const interceptor of this.interceptors?.response?.successHandlers ?? []) {
                    res = await interceptor(res);
                }
            }

            const data = await this.parseBody<T>(res, config.responseType);

            const result: IResponse<T> = {
                data,
                status: res.status,
                statusText: res.statusText,
                headers: res.headers,
                config: config,
            }

            return result;

        }).catch(error => {
            if (this.interceptors) {
                for (const interceptor of this.interceptors?.response.errorHandlers ?? []) {
                    interceptor(error);
                }
            }
            throw error;
        }).finally(() => {
            if (timeoutId) clearTimeout(timeoutId);
        })

        return response;
    }

    private prepareBody(config: IRequestConfig): BodyInit | undefined {
        if (!config.body) return undefined;

        const contentType = config.headers?.get("Content-Type");

        if (typeof config.body == 'string' || config.body instanceof FormData) {
            return config.body;
        }

        if (contentType?.includes('application/json')) {
            return JSON.stringify(config.body);
        }

        return config.body;
    }

    private async parseBody<T>(response: Response, responseType?: string): Promise<T> {

        let result;
        switch (responseType) {
            case "text":
                const text = await response.text();
                result = text as unknown as T;
                break;
            case "blob":
                result = response.blob();
                break;
            default:
                result = response.json();
                break;
        }

        // const contentType = response.headers.get("Content-Type");

        // if (contentType?.includes("application/json")) {
        //     return response.json();
        // }

        // const text = await response.text();
        // return text as unknown as T;

        return result;
    }

}