import { IRequestOptions } from "./IRequestOptions";

export interface IEasyFetchClient{
    get<T = any>(url:string, options?: IRequestOptions): Promise<T>;
    post<T = any>(url:string, options?: IRequestOptions): Promise<T>;
    put<T = any>(url:string, options?: IRequestOptions): Promise<T>;
    delete<T = any>(url:string, options?: IRequestOptions): Promise<T>;
}