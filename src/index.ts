import { IEasyFetchClient, IEasyFetchOptions, IRequestConfig, IRequestOptions } from "./interfaces";
import { IInterceptors } from './interfaces/IInterceptors';

export function createClient(config: IEasyFetchOptions = {}): IEasyFetchClient & { interceptors: IInterceptors } {
    const { baseUrl = "", headers: globalHeaders = {} } = config;

    const interceptors: IInterceptors = {
        request: {
            handlers: [],
            use(fn) {
                this.handlers.push(fn);
            }
        },
        response: {
            successHandlers: [],
            errorHandlers: [],
            use(onSuccess, onError) {
                this.successHandlers.push(onSuccess);
                if (onError) this.errorHandlers.push(onError);
            },
        }
    }

    async function request<T>(
        method: string,
        url: string,
        options: IRequestOptions = {}
    ) {
        let config: IRequestConfig = {
            ...options,
            method,
            url,
        }

        // Run request interceptors
        for (const interceptor of interceptors.request.handlers) {
            config = await interceptor(config);
        }

        const {
            body,
            headers = {},
            queryParams,
            ...rest
        } = options;

        //build URL with request's params if they exist
        
        if (options.queryParams) {
            const qs = new URLSearchParams(options.queryParams as any).toString();
            url += (url.includes("?") ? "&" : "?") + qs
        }

        const fullUrl = baseUrl + url;

        const finalHeaders: HeadersInit = {
            "Content-Type": "application/json",
            ...globalHeaders,
            ...headers
        };

        try {

            const controller = new AbortController();
            const timeourId = setTimeout(() => controller.abort(), options.timeout || 0);

            // Run response success interceptors
            let response = await retryRequest(() => fetch(fullUrl, {
                method,
                headers: finalHeaders,
                body: body ? JSON.stringify(body) : undefined,
                signal: controller.signal,
                ...rest
            }), options.retries, options.retryDelay);

            for (const interceptor of interceptors.response.successHandlers) {
                response = await interceptor(response);
            }

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`Request failed with status ${response.status}: ${errorBody}`);
            }


            // const contentType = response.headers.get("Content-type");
            // if (contentType && contentType.includes("application/json")) {
            //     return response.json();
            // }

            let responseData;
            switch (options.responseType || 'json') {
                case "text":
                    responseData = response.text();
                    break;
                case "blob":
                    responseData = response.blob();
                    break;
                default:
                    responseData = response.json();
            }

            return responseData;
        }
        catch (err) {
            // Run response error interceptors
            for (const handler of interceptors.response.errorHandlers) {
                handler(err);
            }

            throw err;
        }
    }

    async function retryRequest(fn: () => Promise<any>, retries = 3, delay = 500) {
        try {
            return await fn();
        } catch (error) {
            if (retries <= 0) throw error;
            await new Promise(r => setTimeout(r, delay));
            return retryRequest(fn, retries - 1, delay);
        }
    }

    // const client: IEasyFetchClient & { interceptors: IInterceptors } = {
    //     get: (url, options) => request("GET", url, options),
    //     post: (url, options) => request("POST", url, options),
    //     put: (url, options) => request("PUT", url, options),
    //     delete: (url, options) => request("DELETE", url, options),
    //     interceptors,
    // }

    const client = (url: string, options?: IRequestOptions) => request("GET", url, options); // por defecto GET

    // agregas los otros métodos
    client.get = (url: string, options?: IRequestOptions) => request("GET", url, options);
    client.post = (url: string, options?: IRequestOptions) => request("POST", url, options);
    client.put = (url: string, options?: IRequestOptions) => request("PUT", url, options);
    client.delete = (url: string, options?: IRequestOptions) => request("DELETE", url, options);

    client.interceptors = interceptors;

    return client;
}