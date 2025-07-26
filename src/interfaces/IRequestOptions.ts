export interface IRequestOptions {
    body?: any;
    headers?: Record<string, string>;
    queryParams?: Record<string, string | number | boolean>;
    responseType?: 'json' | 'text' | 'blob';
    timeout?: number;
    retries?: number;
    retryDelay?: number;
    params?: Record<string, string | number | boolean>
}