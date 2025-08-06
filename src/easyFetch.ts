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
        config.url = this.baseUrl + (config.url || '');

        // headers
        if (this.token) {
            this.httpHeaders = {
                "Authorization": `Bearer ${this.token}`,
                ...this.httpHeaders
            };
        }

        if (!config.headers) {
            config.headers = new Headers({ "Content-Type": "application/json" });
        }

        if (this.httpHeaders) {
            Object.entries(this.httpHeaders).forEach(([key, value]) => {
                config.headers?.append(key, value);
            })
        }

        // add request interceptors
        for (const interceptor of this.interceptors?.request?.handlers ?? []) {
            config = await interceptor(config);
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
        }), config.retries, config.retryDelay).then(async (res: Response) => {

            let result: IResponse<T> = {
                data: undefined as unknown as T,
                status: res.status,
                statusText: res.statusText,
                headers: res.headers,
            };

            const contenType = res.headers.get("Content-Type") || '';

            for (const interceptor of this.interceptors?.response?.successHandlers ?? []) {
                res = await interceptor(res);
            }

            const wasModified = typeof (res as any).data !== "undefined";

            if (!wasModified) {
                let data = await this.parseBody<T>(res, contenType);

                result = {
                    data,
                    status: res.status,
                    statusText: res.statusText,
                    headers: res.headers,
                }
            } else {
                result.data = (res as any).data;
            }

            return result;

        }).catch(error => {
            for (const interceptor of this.interceptors?.response.errorHandlers ?? []) {
                interceptor(error);
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

    private async parseBody<T>(response: Response, contentType: string): Promise<T> {

        if (contentType.includes("application/json")) {
            return await response.json();
        }

        if (contentType.includes("text/")) {
            return await response.text() as T;
        }

        if (contentType.includes("application/pdf") || contentType.includes("application/octet-stream")) {
            return await response.blob() as T;
        }

        // fallback
        return await response.text() as T;
    }

}