import { EasyFetch } from "./easyFetch";
import { IEasyFetchClient, IEasyFetchOptions, IInterceptors, IRequestConfig } from "./types";

type clienType = IEasyFetchClient & { interceptors?: IInterceptors }

export function createClient(config: IEasyFetchOptions = {}): clienType {

    const interceptors: IInterceptors = {
        request: {
            handlers: [],
            use(fn) {
                this.handlers.push(fn);
            },
        },
        response: {
            successHandlers: [],
            errorHandlers: [],
            use(onSuccess, onError) {
                this.successHandlers.push(onSuccess);
                if (onError) this.errorHandlers?.push(onError);
            },
        },
    };

    const easyFetch = new EasyFetch(config, interceptors);

    const client: IEasyFetchClient & { interceptors?: IInterceptors } = {
        get: <T = any>(url: string, options?: IRequestConfig) => easyFetch.request<T>({ ...options, url, method: "GET" }),
        post: <T = any>(url: string, options?: IRequestConfig) => easyFetch.request<T>({ ...options, url, method: "POST" }),
        put: <T = any>(url: string, options?: IRequestConfig) => easyFetch.request<T>({ ...options, url, method: "PUT" }),
        patch: <T = any>(url: string, options?: IRequestConfig) => easyFetch.request<T>({ ...options, url, method: "PATCH" }),
        delete: <T = any>(url: string, options?: IRequestConfig) => easyFetch.request<T>({ ...options, url, method: "DELETE" }),
        interceptors,
    }

    return client;
}
