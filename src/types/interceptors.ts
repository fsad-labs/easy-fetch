import { IRequestConfig } from ".";

export type Interceptor = (config: IRequestConfig) => IRequestConfig | Promise<IRequestConfig>;
export type ResponseHandler = (response: Response) => Response | Promise<Response>;
export type ErrorHandler = (error:any) => any;


export interface IInterceptors {
    request: {
        use: (fn: Interceptor) => void,
        handlers: Interceptor[]
    },
    response: {
        use: (onSuccess: ResponseHandler, onError?: ErrorHandler) => void;
        successHandlers: ResponseHandler[],
        errorHandlers: ErrorHandler[];
    }
}