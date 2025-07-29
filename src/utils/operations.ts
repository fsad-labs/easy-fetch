export async function retryRequest(fn: () => Promise<any>, retries: number = 3, delay: number = 500) {
    try {
        return await fn();
    }
    catch (error) {
        if (retries <= 0) throw error;
        await new Promise(r => setTimeout(r, delay));
        return retryRequest(fn, retries - 1, delay);
    }

}