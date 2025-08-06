# easy-fetch

A lightweight and flexible wrapper around the Fetch API that simplifies HTTP requests with reusable clients and built-in middleware support.

## Features

- Base URL support
- Global headers
- Interceptor or middleware
- Automatic JSON parsing
- Simplified error handling

## Install

```bash
npm i @fsad-labs/easy-fetch
```

## API Reference

#### # easyFetch

| Props (instance) | Type     | Description                |
| :-------- | :------- | :------------------------- |
|`get`|`function`| HTTP GET
|`post`|`function`| HTTP POST
|`put`|`function`| HTTP PUT
|`delete`|`function`| HTTP DELETE
|`interceptors`|`any`| Interceptors [ Request, Response ]: Use

| Response | Type     | Description                |
| :-------- | :------- | :------------------------- |
|`data`|`boolean`| data returned
|`status`|`string`| contains the HTTP status codes of the response.
|`statusText`|`string`| contains the status message corresponding to the HTTP status code
|`headers`|`any`| response headers


## Usage

You can use these different clients for make you fetch call API or create your own client with easyFetch.  

```bash
const { 
    easyFetch,
    createClient,
    easyFetchAuth,
    easyFetchWithHeaders,
    easyFetchWithTimeout } = require('@fsad-labs/easy-fetch');

```

- [x] easyFetch
The default fetch wrapper with automatic JSON parsing and basic error handling.


```bash
const baseUrl = "https://jsonplaceholder.typicode.com";

easyFetch(baseUrl).get("/todos/1").then((res) =>  {
    //TODO 
});

easyFetch(baseUrl).post("/post", {
    body: {
        userId: 1,
        title: "TEST",
        body: "TEST Library"
    }
}).then(res => { // TODO  });

easyFetch(baseUrl).put("/put", {
    body: {
        userId: 1,
        id: 1,
        title: "TEST",
        body: "TEST Library edited"
    }
}).then(res=> { //TODO });

easyFetch(baseUrl).delete("/delete").then(res=> { //TODO } )

```

- [x] createClient
Create a reusable client, use the request or response middlewares and headers settings.

```bash
const easyFetchcustomClient = createClient({ baseUrl: "https://jsonplaceholder.typicode.com" });

easyFetchcustomClient.interceptors.request.use((config) => {
    //TODO: Update the request config
    config.headers.append("Custom", "custom-header");
    config.headers.append("Content-Type", "application/json; charset=UTF-8");

    return config;
});

easyFetchcustomClient.interceptors.response.use(async response => {
    // TODO: manage the respone and ensure to return
    // { data: any, status:number, statusText:string ,headers: Headers  }

    if (response.headers.get("Content-Type")?.includes("application/json")) {
        const data = await response.json();
        return {
            data,
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
        };
    }
    
    return response;

}, (err) => {
    // TODO: Catch the error by yourself 
    console.log("HANLDER ERROR => ", err);
});

easyFetchcustomClient.get("/todos/1").then((result) => {
    console.log(result);
}).catch((err) => {
    // TODO: Catch the error
});

```
- [x] easyFetchAuth

Use this client to easily make authenticated requests.

```bash
auth.interceptors.request.use((config) => {
    //TODO: Update the request config
    return config;
})

auth.get().then((result) => {
    //TODO: Automate return json
});

```

- [x] easyFetchWithHeaders
Send requests with custom headers.

```bash
const withCustomHeaders = easyFetchWithHeaders(baseUrl, {
    "Authorization": "Bearer token-custom"
});

withCustomHeaders.interceptors.request.use(config => {
    //TODO: Update the request config
    // View the headers => console.log(config.headers)
    return config;
});

withCustomHeaders.get().then((result) => {
    console.log(result.data);
});

```

- [x] easyFetchWithTimeout

Make requests with a timeout (milliseconds).

```bash
const withTimeout = easyFetchWithTimeout(baseUrl, 2000)

withTimeout.interceptors.response.use(async response => {
    await new Promise(r => setTimeout(r, 4000));
    return response;
}, err => {
    console.log(`Error details: ${err.message || err}`);
});

withTimeout.get().then((result) => {
    console.log(result.data);
}).catch(err => {
    console.log("Catching the error in te get function");
});
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License
This project is licensed under the [MIT License](LICENSE) © [fullstack-ad](https://github.com/fullstack-ad)





