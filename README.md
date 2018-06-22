# fetch-extra

[![Build Status](https://travis-ci.org/Cap32/fetch-extra.svg?branch=master)](https://travis-ci.org/Cap32/fetch-extra)
[![Coverage Status](https://coveralls.io/repos/github/Cap32/fetch-extra/badge.svg?branch=master)](https://coveralls.io/github/Cap32/fetch-extra?branch=master)
[![License](https://img.shields.io/badge/license-MIT_License-brightgreen.svg?style=flat)](https://github.com/Cap32/fetch-extra/blob/master/LICENSE)

Extra features for whatwg fetch and Request like `query` option, JSON `body` option, timeout, abort, `transformers`

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Installation](#installation)
- [fetch](#fetch)
- [Request](#request)
  - [New `Request#fetch()` method](#new-requestfetch-method)
  - [Enhanced `url` option](#enhanced-url-option)
  - [Enhanced `Request#clone(...options)` method](#enhanced-requestcloneoptions-method)
  - [New `responseType` option](#new-responsetype-option)
  - [New `query` option](#new-query-option)
  - [Enhanced `body` option](#enhanced-body-option)
  - [New `type` option](#new-type-option)
  - [New `simple` option](#new-simple-option)
  - [Polyfill `AbortController`](#polyfill-abortcontroller)
  - [New `queryStringify` option](#new-querystringify-option)
  - [New `queryParse` option](#new-queryparse-option)
  - [New `queryTransformer` option](#new-querytransformer-option)
  - [New `urlTransformer` option](#new-urltransformer-option)
  - [New `headersTransformer` option](#new-headerstransformer-option)
  - [New `bodyTransformer` option](#new-bodytransformer-option)
  - [New `responseTransformer` option](#new-responsetransformer-option)
  - [New `responseDataTransformer` option](#new-responsedatatransformer-option)
  - [New `errorTransformer` option](#new-errortransformer-option)
- [License](#license)

## Installation

Using npm:

```bash
$ npm install fetch-extra
```

Using yarn:

```bash
$ yarn add fetch-extra
```

**To install fetch-extra with `window.fetch` polyfill, please istall `fetch-extra-polyfill` instead**

## fetch

```js
import fetch from "fetch-extra";
(async function main() {
  const url = "https://swapi.co/api/people/";
  const res = await fetch(url, {
    method: "POST",
    type: "json" /* json Content-Type header */,
    responseType: "json" /* short for `await res.json()` */,
    query: { token: "asdf" } /* query object */,
    body: {
      /* json body object */
      firstName: "Luke",
      familyName: "Skywalker"
    }
  });
  console.log(res.name); /* Luke Skywalker */
})();
```

##### Syntax

> Promise\<Response\> fetch(...options)

`...options` \<...String|Object|Request\>

- If `options` is a string, it is treated as a `URL`
- If `options` is a object, it is treated as `Request` options. Checkout below for detail. All [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) options are supported

Later `options` will similarly overwrite earlier ones.

##### Description

> The Fetch API provides an interface for fetching resources.

`fetch` syntax adapts to [WHATWG fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API):

```js
import fetch from "fetch-extra";
(async function main() {
  const url = "https://swapi.co/api/people/1/";
  const res = await fetch(url, { method: "GET" });
  const luke = await res.json();
  console.log(luke.name); /* Luke Skywalker */
})();
```

But there are some extra options.

```js
const res = await fetch({
  url: "https://swapi.co/api/people/1/",
  query: { page: 32 },
  responseType: "json",
  timeout: 30000,
});
```

For more extra options and usages, please checkout below.

## Request

```js
import { Request } from "fetch-extra";
(async function main() {
  const base = new Request({
    url: "https://swapi.co/api/",
    type: "json",
    responseType: "json",
    timeout: 30000,
    async headersTransformer(headers) {
        headers['access-token'] = await fakeGetToken(),
        return headers;
    },
  });
  const people = base.clone("/people");
  const starships = base.clone("/starships");

  const luke = await people.fetch("/1");
  const c3po = await people.fetch("/2");
  const starDestroyer = await starships.fetch("/3");
})();
```

##### Syntax

> \<Request\> new Request(...options)

`...options` \<...String|Object|Request\>

All options are the same with `fetch`.

##### Description

> The Request interface of the Fetch API represents a resource request.

Request syntax also adapts to [WHATWG Request](https://developer.mozilla.org/en-US/docs/Web/API/Request).

```js
import fetch, { Request } from "fetch-extra";
(async function main() {
  const url = "https://swapi.co/api/people/1/";
  const request = new Request(url);
  const res = await fetch(request);
  const luke = await res.json();
})();
```

But there are some extra options and methods.

##### Why

`fetch()` is useful, but `new Request()` provides a way to inherit requests. It is recommended to create a base `Request` instance to share base url, `Content-Type` header, access token header, response type, error handler (by using [errorTransformer()](#new-errortransformer-option)), etc, and then `fetch()` or `clone()` the base request.

### New `Request#fetch()` method

```js
import { Request } from 'fetch-extra';
const request = new Request(url);
const res = await request.fetch();
const luke = await res.json();
```

Fetching with options:

```js
import { Request } from 'fetch-extra';
const request = new Request(url);
const res = await request.fetch({ method: 'DELETE' });
const luke = await res.json();
```

The example above is equal to:

```js
import fetch, { Request } from 'fetch-extra';
const request = new Request(url);
const res = await fetch(request, { method: 'DELETE' });
const luke = await res.json();
```

### Enhanced `url` option

`URLs` could be composed.

```js
const baseUrl = 'https://swapi.co/api/';
const swRequest = new Request(baseUrl);

const lukeRes = await swRequest.fetch('/people/1/');
/* final URL will be "https://swapi.co/api/people/1/" */

const starShipRes = await swRequest.fetch('/starships/9/');
/* final URL will be "https://swapi.co/api/starships/9/" */
```

To override earlier URL, just give a new URL starts with a protocol (like `http://` or `https://`):

```js
const swRequest = new Request("https://swapi.co/", options);
const pokeRes = swRequest.fetch("https://pokeapi.co/api/v2/");
/* final URL will be "https://pokeapi.co/api/v2/" */
```

### Enhanced `Request#clone(...options)` method

```js
const baseRequest = new Request({
    headers: { 'Content-Type': 'application/json' },
});

const swRequest = baseRequest.clone('https://swapi.co/api/');
const luke = await swRequest.fetch('/people/1/');
const c3po = await swRequest.fetch('/people/2/');

const pokeRequest = baseRequest.clone('https://pokeapi.co/api/v2/');
const bulbasaur = await pokeRequest.fetch('/pokemon/1/');
```

The `...options` usages are the same with `fetch` or `Request`

### New `responseType` option

Returning resolved data with specified type instead of `response` object.

```js
const options = { responseType: 'json' };
const luke = await swRequest.fetch(options); /* <-- no need `await res.json()` */
console.log(luke.name); /* Luke Skywalker */
```

In browser, `responseType` value could be one of `arrayBuffer`, `blob`, `formData`, `json` or `text`.

In Node.js, `formData` is NOT supported.

### New `query` option

```js
const results = await swRequest.fetch({ query: { search: 'luke' } });
/* final URL will be "https://swapi.co/api/people?search=luke" */
```

`query` could be JSON object or string (like `name=luke&height=172`).

If `url` has search fields (like `https://swapi.co/api/people?search=luke`), query string will append to the search fields.

### Enhanced `body` option

```js
const results = await swRequest.fetch({
    method: 'POST',
    body: { name: 'Luke Skywalker' }, /* <-- could be a JSON */
});
/* final body will be '{"name":"Luke Skywalker"}' */
```

### New `type` option

```js
const results = await swRequest.fetch({
    method: 'POST',
    type: 'form'
    body: { name: 'Luke Skywalker' },
});
/* final body will be 'name=Luke%20Skywalker' */
/* final header['Content-Type'] will be 'application/x-www-form-urlencoded' */
```

`type` value will auto set to headers `Content-Type`.

Value `form` is short for `application/x-www-form-urlencoded`, and `json` is short for `application/json`.

### New `simple` option

Will throw error if `response` status is non-2xx.

```js
await swRequest.fetch({
    simple: true,
    url: '/400', /* simulate response with 400 HTTP status */
}).catch((err) => {
    console.error(err); /* <-- Error: Bad Request  */
});
```

### Polyfill `AbortController`

Built-in [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) and [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) polyfill for [aborting fetch](https://developers.google.com/web/updates/2017/09/abortable-fetch).

```js
import fetch, { AbortController } from 'fetch-extra';
const abortController = new AbortController();
const fetchPromise = fetch({
    url: 'https://swapi.co/api/people/1',
    signal: abortController.signal,
});
abortController.abort();
await fetchPromise.catch((err) => {
    if (err.name === 'AbortError') console.warn('The user aborted a request.');
    else console.error(err.message);
});
```

### New `queryStringify` option

Setting a custom function in charge of serializing `query` object.

```js
import qs from "qs";

const request = new Request({
  queryStringify: qs.stringify
});
```

By default, this function is [tiny-querystring](https://github.com/Cap32/tiny-querystring#stringifyobj) `stringify` function.

### New `queryParse` option

Setting a custom function in charge of parsing `query` string.

```js
import qs from "qs";

const request = new Request({
  queryParse: qs.parse
});
```

By default, this function is [tiny-querystring](https://github.com/Cap32/tiny-querystring#stringifyobj) `parse` function.

### New `queryTransformer` option

Setting a function to transform `query` object, should return a new `query` object. Will be called before fetching.

```js
const baseRequest = new Request({
    queryTransformer: (query) => { /* <-- queryTransformer */
        query.accessToken = '<ACCESS_TOKEN>',
        return query;
    },
});
const swRequest = baseRequest.clone('https://swapi.co/api/');
const results = await swRequest.fetch('/people', {
    query: { search: 'luke' },
});
/* final URL will be "https://swapi.co/api/people?search=luke&accessToken=<ACCESS_TOKEN>" */
```

All transformers could return promises.

```js
const baseRequest = new Request({
    async queryTransformer(query) { /* <-- async queryTransformer */
        query.accessToken = await getTokenAsync(),
        return query;
    },
});
/* ... */
```

### New `urlTransformer` option

Like `queryTransformer`, but transform `url`.

### New `headersTransformer` option

Like `queryTransformer`, but transform `headers`.

### New `bodyTransformer` option

Like `queryTransformer`, but transform `body`.

### New `responseTransformer` option

Transform [response](https://developer.mozilla.org/en-US/docs/Web/API/Response) instance.

```js
const baseRequest = new Request({
  responseType: "json",
  responseTransformer(response) {
    /* <-- responseTransformer */
    if (response.status === 404) {
      throw new Error("Page not found");
    }
    return response;
  }
});
/* ... */
```

### New `responseDataTransformer` option

Like `responseTransformer`, but transform the data after `responseType` resolved.

```js
const baseRequest = new Request({
  responseType: "json",
  responseDataTransformer(json) {
    /* <-- responseDataTransformer */
    if (json) {
      json.fullName = `${json.firstName} ${json.familyName}`;
    }
    return json;
  }
});
/* ... */
```

### New `errorTransformer` option

Transform error or rejection.

```js
const baseRequest = new Request({
  errorTransformer(error) {
    /* <-- errorTransformer */
    if (error.name === "Abort") {
      console.warn("Fetch aborted");
    }
    return error;
  }
});
/* ... */
```

## License

MIT
