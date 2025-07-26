import { IRequestConfig } from "./IRequestConfig";

type RequestInterceptor = (config: IRequestConfig) => IRequestConfig | Promise<IRequestConfig>;
type ResponseInterceptor = (config: Response) => Response | Promise<Response>;
type ErrorInterceptor = (error: any) => any;

export interface IInterceptors {
    request: {
        use: (fn: RequestInterceptor) => void,
        handlers: RequestInterceptor[]
    },
    response: {
        use: (onSuccess: ResponseInterceptor, onError?: ErrorInterceptor) => void;
        successHandlers: ResponseInterceptor[],
        errorHandlers: ErrorInterceptor[];
    }
}