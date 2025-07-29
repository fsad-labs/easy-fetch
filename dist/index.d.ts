interface IRequestOptions {
    body?: any;
    headers?: Headers;
    queryParams?: Record<string, string | number | boolean>;
    responseType?: 'json' | 'text' | 'blob';
    timeout?: number;
    retries?: number;
    retryDelay?: number;
    params?: Record<string, string>;
    signal?: AbortSignal;
}

interface IEasyFetchOptions {
    baseUrl?: string;
    headers?: Record<string, string>;
    timeout?: number;
    token?: string;
}
interface IRequestConfig extends IRequestOptions {
    url: string;
    method: string;
}

interface IResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: Headers;
    config: IRequestConfig;
}

type Interceptor = (config: IRequestConfig) => IRequestConfig | Promise<IRequestConfig>;
type ResponseHandler = (response: Response) => Response | Promise<Response>;
type ErrorHandler = (error: any) => any;
interface IInterceptors {
    request: {
        use: (fn: Interceptor) => void;
        handlers: Interceptor[];
    };
    response: {
        use: (onSuccess: ResponseHandler, onError?: ErrorHandler) => void;
        successHandlers: ResponseHandler[];
        errorHandlers: ErrorHandler[];
    };
}

interface IEasyFetchClient {
    get<T = any>(url: string, options?: IRequestOptions): Promise<IResponse<T>>;
    post<T = any>(url: string, options?: IRequestOptions): Promise<IResponse<T>>;
    put<T = any>(url: string, options?: IRequestOptions): Promise<IResponse<T>>;
    delete<T = any>(url: string, options?: IRequestOptions): Promise<IResponse<T>>;
    patch<T = any>(url: string, options?: IRequestOptions): Promise<IResponse<T>>;
}

declare function createClient(config?: IEasyFetchOptions): IEasyFetchClient & {
    interceptors?: IInterceptors;
};

declare const easyFetchAuth: (baseUrl: string, token: string) => IEasyFetchClient & {
    interceptors?: IInterceptors;
};
declare const easyFetchWithTimeout: (baseUrl: string, timeout?: number) => IEasyFetchClient & {
    interceptors?: IInterceptors;
};
declare const easyFetchWithHeaders: (baseUrl: string, headers?: Record<string, string>) => IEasyFetchClient & {
    interceptors?: IInterceptors;
};

declare const easyFetch: (url?: string) => IEasyFetchClient & {
    interceptors?: IInterceptors;
};

export { createClient, easyFetch, easyFetchAuth, easyFetchWithHeaders, easyFetchWithTimeout };
