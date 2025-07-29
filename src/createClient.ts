import { EasyFetch } from "./easyFetch";
import { IEasyFetchClient, IEasyFetchOptions, IInterceptors, IRequestConfig } from "./types";

export function createClient(config: IEasyFetchOptions = {}): IEasyFetchClient & { interceptors?: IInterceptors } {

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
        get: (url: string, options?: IRequestConfig) => easyFetch.request({ ...options, url: url, method: "GET" }),
        post: (url: string, options?: IRequestConfig) => easyFetch.request({ ...options, url, method: "POST" }),
        put: (url: string, options?: IRequestConfig) => easyFetch.request({ ...options, url, method: "PUT" }),
        patch: (url: string, options?: IRequestConfig) => easyFetch.request({ ...options, url, method: "PATCH" }),
        delete: (url: string, options?: IRequestConfig) => easyFetch.request({ ...options, url, method: "DELETE" }),
        interceptors,
    }

    return client;
}
