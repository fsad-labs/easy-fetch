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
## Usage

You can use these different clients for make you fetch call API.  

```bash
const { easyFetch,
    createClient,
    easyFetchAuth,
    easyFetchWithHeaders,
    easyFetchWithTimeout } =  require('@fsad-labs/easy-fetch');

```

- [x] easyFetch
The default fetch wrapper with automatic JSON parsing and basic error handling.


```bash
const baseUrl = "https://jsonplaceholder.typicode.com";

easyFetch(baseUrl).get("/todos/1").then((res) => console.log("GET", res.data));

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
    config.headers.append("Custom", "custom-header");
    config.headers.append("Content-Type", "application/json; charset=UTF-8");

    return config;
});

easyFetchcustomClient.interceptors.response.use((response, error) => {
    console.log("Interceptor => ", response);
    throw new Error("TROW NEW ERROR FROM intepceptor");
}, (err) => {
    console.log("HANLDER ERROR => ", err);
});

easyFetchcustomClient.get("/todos/1").then((result) => {
    console.log(result);
}).catch((err) => {
    console.log(err);
});

```
- [x] easyFetchAuth

Use this client to easily make authenticated requests.

```bash
const fetchAuth = easyFetchAuth(baseUrl, token);
fetchAuth.get('/todos/1').then(res => console.log(res));
```

- [x] easyFetchWithHeaders
Send requests with custom headers.

```bash
const fetchHeader = easyFetchWithHeaders(baseUrl, headers);
fetchHeader.get('/todos/1').then(res => console.log(res));
```

- [x] easyFetchWithTimeout

Make requests with a timeout (milliseconds).

```bash
const withTimeout = easyFetchWithTimeout(baseUrl, timeout)
withTimeout.get('/todos/1').then(res => console.log(res));
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License
This project is licensed under the [MIT License](LICENSE) © [fullstack-ad](https://github.com/fullstack-ad)





