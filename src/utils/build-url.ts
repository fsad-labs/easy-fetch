export function buildUrl(baseUrl: string, params?: Record<string, string>) {
    const url = new URL(baseUrl);
    if (params) {
        Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
    }

    return url.toString();
}