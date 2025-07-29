"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  createClient: () => createClient,
  easyFetch: () => easyFetch,
  easyFetchAuth: () => easyFetchAuth,
  easyFetchWithHeaders: () => easyFetchWithHeaders,
  easyFetchWithTimeout: () => easyFetchWithTimeout
});
module.exports = __toCommonJS(index_exports);

// src/utils/build-url.ts
function buildUrl(baseUrl, params) {
  const url = new URL(baseUrl);
  if (params) {
    Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
  }
  return url.toString();
}

// src/utils/operations.ts
async function retryRequest(fn, retries = 3, delay = 500) {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    await new Promise((r) => setTimeout(r, delay));
    return retryRequest(fn, retries - 1, delay);
  }
}

// src/easyFetch.ts
var EasyFetch = class {
  baseUrl;
  httpHeaders;
  timeout;
  token;
  interceptors;
  constructor(options = {}, interceptors) {
    this.baseUrl = options.baseUrl ?? "";
    this.httpHeaders = options.headers;
    this.timeout = options.timeout ?? 0;
    this.token = options.token;
    this.interceptors = interceptors;
  }
  async request(config) {
    config.url = this.baseUrl + config.url;
    if (this.token) {
      console.log("Adding token", this.token);
      this.httpHeaders = {
        "Authorization": `Bearer ${this.token}`,
        ...this.httpHeaders
      };
    }
    console.log("this.httpHeaders", this.httpHeaders);
    if (!config.headers) {
      config.headers = new Headers({ "Content-Type": "application/json" });
    }
    if (this.httpHeaders) {
      Object.entries(this.httpHeaders).forEach(([key, value]) => {
        config.headers?.append(key, value);
      });
    }
    console.log("config.headers", config.headers);
    if (this.interceptors) {
      for (const interceptor of this.interceptors?.request?.handlers ?? []) {
        config = await interceptor(config);
      }
    }
    const finalUrl = buildUrl(config.url, config.params);
    const controller = new AbortController();
    const timeoutId = config.timeout ?? this.timeout ? setTimeout(() => controller.abort(), config.timeout ?? this.timeout) : null;
    const response = await retryRequest(() => fetch(finalUrl, {
      method: config.method,
      headers: config.headers,
      body: this.prepareBody(config),
      signal: config.signal ?? controller.signal
    }), config.retries, config.retryDelay).then(async (res) => {
      if (this.interceptors) {
        for (const interceptor of this.interceptors?.response?.successHandlers ?? []) {
          res = await interceptor(res);
        }
      }
      const data = await this.parseBody(res, config.responseType);
      const result = {
        data,
        status: res.status,
        statusText: res.statusText,
        headers: res.headers,
        config
      };
      return result;
    }).catch((error) => {
      if (this.interceptors) {
        for (const interceptor of this.interceptors?.response.errorHandlers ?? []) {
          interceptor(error);
        }
      }
      throw error;
    }).finally(() => {
      if (timeoutId) clearTimeout(timeoutId);
    });
    return response;
  }
  prepareBody(config) {
    if (!config.body) return void 0;
    const contentType = config.headers?.get("Content-Type");
    if (typeof config.body == "string" || config.body instanceof FormData) {
      return config.body;
    }
    if (contentType?.includes("application/json")) {
      return JSON.stringify(config.body);
    }
    return config.body;
  }
  async parseBody(response, responseType) {
    let result;
    switch (responseType) {
      case "text":
        const text = await response.text();
        result = text;
        break;
      case "blob":
        result = response.blob();
        break;
      default:
        result = response.json();
        break;
    }
    return result;
  }
};

// src/createClient.ts
function createClient(config = {}) {
  const interceptors = {
    request: {
      handlers: [],
      use(fn) {
        this.handlers.push(fn);
      }
    },
    response: {
      successHandlers: [],
      errorHandlers: [],
      use(onSuccess, onError) {
        this.successHandlers.push(onSuccess);
        if (onError) this.errorHandlers?.push(onError);
      }
    }
  };
  const easyFetch2 = new EasyFetch(config, interceptors);
  const client = {
    get: (url, options) => easyFetch2.request({ ...options, url, method: "GET" }),
    post: (url, options) => easyFetch2.request({ ...options, url, method: "POST" }),
    put: (url, options) => easyFetch2.request({ ...options, url, method: "PUT" }),
    patch: (url, options) => easyFetch2.request({ ...options, url, method: "PATCH" }),
    delete: (url, options) => easyFetch2.request({ ...options, url, method: "DELETE" }),
    interceptors
  };
  return client;
}

// src/client.ts
var easyFetchAuth = (baseUrl, token) => createClient({ baseUrl, token });
var easyFetchWithTimeout = (baseUrl, timeout) => createClient({ baseUrl, timeout });
var easyFetchWithHeaders = (baseUrl, headers) => createClient({ baseUrl, headers });

// src/index.ts
var easyFetch = (url) => createClient({ baseUrl: url });
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createClient,
  easyFetch,
  easyFetchAuth,
  easyFetchWithHeaders,
  easyFetchWithTimeout
});
