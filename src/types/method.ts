import { IRequestOptions } from "./request";
import { IResponse } from './response';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface IEasyFetchClient{
    get<T = any>(url:string, options?: IRequestOptions): Promise<IResponse<T>>;
    post<T = any>(url:string, options?: IRequestOptions): Promise<IResponse<T>>;
    put<T = any>(url:string, options?: IRequestOptions): Promise<IResponse<T>>;
    delete<T = any>(url:string, options?: IRequestOptions): Promise<IResponse<T>>;
    patch<T = any>(url:string, options?: IRequestOptions): Promise<IResponse<T>>;
}