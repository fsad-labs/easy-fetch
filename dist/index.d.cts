interface IRequestOptions {
    body?: any;
    headers?: Record<string, string>;
    queryParams?: Record<string, string | number | boolean>;
}

interface IEasyFetchOptions {
    baseUrl?: string;
    headers?: Record<string, string>;
}

interface IEasyFetchClient {
    get<T = any>(url: string, options?: IRequestOptions): Promise<T>;
    post<T = any>(url: string, options?: IRequestOptions): Promise<T>;
    put<T = any>(url: string, options?: IRequestOptions): Promise<T>;
    delete<T = any>(url: string, options?: IRequestOptions): Promise<T>;
}

interface IRequestConfig extends IRequestOptions {
    url: string;
    method: string;
}

type RequestInterceptor = (config: IRequestConfig) => IRequestConfig | Promise<IRequestConfig>;
type ResponseInterceptor = (config: Response) => Response | Promise<Response>;
type ErrorInterceptor = (error: any) => any;
interface IInterceptors {
    request: {
        use: (fn: RequestInterceptor) => void;
        handlers: RequestInterceptor[];
    };
    response: {
        use: (onSuccess: ResponseInterceptor, onError?: ErrorInterceptor) => void;
        successHandlers: ResponseInterceptor[];
        errorHandlers: ErrorInterceptor[];
    };
}

declare function createClient(config?: IEasyFetchOptions): IEasyFetchClient & {
    interceptors: IInterceptors;
};

export { createClient };
