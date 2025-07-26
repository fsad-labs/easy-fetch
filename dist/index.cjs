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
  createClient: () => createClient
});
module.exports = __toCommonJS(index_exports);
function createClient(config = {}) {
  const { baseUrl = "", headers: globalHeaders = {} } = config;
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
        if (onError) this.errorHandlers.push(onError);
      }
    }
  };
  async function request(method, url, options = {}) {
    let config2 = {
      ...options,
      method,
      url
    };
    for (const interceptor of interceptors.request.handlers) {
      config2 = await interceptor(config2);
    }
    const {
      body,
      headers = {},
      queryParams,
      ...rest
    } = options;
    const queryString = queryParams ? "?" + new URLSearchParams(queryParams).toString() : "";
    const fullUrl = baseUrl + url + queryString;
    const finalHeaders = {
      "Content-Type": "application/json",
      ...globalHeaders,
      ...headers
    };
    try {
      let response = await fetch(fullUrl, {
        method,
        headers: finalHeaders,
        body: body ? JSON.stringify(body) : void 0,
        ...rest
      });
      for (const interceptor of interceptors.response.successHandlers) {
        response = await interceptor(response);
      }
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Request failed with status ${response.status}: ${errorBody}`);
      }
      const contentType = response.headers.get("Content-type");
      if (contentType && contentType.includes("application/json")) {
        return response.json();
      }
      return response.text();
    } catch (err) {
      for (const handler of interceptors.response.errorHandlers) {
        handler(err);
      }
      throw err;
    }
  }
  const client = (url, options) => request("GET", url, options);
  client.get = (url, options) => request("GET", url, options);
  client.post = (url, options) => request("POST", url, options);
  client.put = (url, options) => request("PUT", url, options);
  client.delete = (url, options) => request("DELETE", url, options);
  client.interceptors = interceptors;
  return client;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createClient
});
