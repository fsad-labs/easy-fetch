import { IRequestConfig } from "./config";

export interface IResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: Headers;
    config: IRequestConfig
}