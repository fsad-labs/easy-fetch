export type RequestMiddleware = (req: RequestInit & { url: string }) => Promise<typeof req> | typeof req;
export type ResponseMiddleware<T = any> = (res: T) => Promise<T> | T;
export type ErrorMiddleware = (error: any) => Promise<any> | any;