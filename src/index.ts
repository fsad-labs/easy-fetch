import { createClient } from './createClient';

export const easyFetch = (url?: string) => createClient({ baseUrl: url });

export * from './createClient'
export * from './client'