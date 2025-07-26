import { IRequestOptions } from "./IRequestOptions";

export interface IRequestConfig extends IRequestOptions{
    url:string;
    method:string;
}