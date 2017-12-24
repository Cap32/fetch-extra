# fetch-extra

[![Build Status](https://travis-ci.org/Cap32/fetch-extra.svg?branch=master)](https://travis-ci.org/Cap32/fetch-extra)
[![Coverage Status](https://coveralls.io/repos/github/Cap32/fetch-extra/badge.svg?branch=master)](https://coveralls.io/github/Cap32/fetch-extra?branch=master)
[![dependencies Status](https://david-dm.org/cap32/fetch-extra/status.svg)](https://david-dm.org/cap32/fetch-extra)
[![License](https://img.shields.io/badge/license-MIT_License-blue.svg?style=flat)](https://github.com/Cap32/fetch-extra/blob/master/LICENSE)

Extra features for whatwg fetch and Request like `query` option, JSON `body` option, timeout, `transformers`


## Table of Contents
<!-- MarkdownTOC -->

- [Installation](#installation)
- [fetchExtra](#fetchextra)
- [RequestExtra](#requestextra)
    - [New `Request#fetch()` method](#new-requestfetch-method)
    - [Enhanced `url` option](#enhanced-url-option)
    - [Enhanced `Request#clone(...options)` method](#enhanced-requestcloneoptions-method)
    - [New `resolveType` option](#new-resolvetype-option)
    - [New `query` option](#new-query-option)
    - [Enhanced `body` option](#enhanced-body-option)
    - [New `type` option](#new-type-option)
    - [New `simple` option](#new-simple-option)
    - [New `queryTransformer` option](#new-querytransformer-option)
    - [New `urlTransformer` option](#new-urltransformer-option)
    - [New `headersTransformer` option](#new-headerstransformer-option)
    - [New `bodyTransformer` option](#new-bodytransformer-option)
    - [New `responseTransformer` option](#new-responsetransformer-option)
    - [New `responseDataTransformer` option](#new-responsedatatransformer-option)
    - [New `errorTransformer` option](#new-errortransformer-option)
- [License](#license)

<!-- /MarkdownTOC -->


<a name="installation"></a>
## Installation

Using npm:

```bash
$ npm install fetch-extra
```

Using yarn:

```bash
$ yarn add fetch-extra
```

<a name="fetchextra"></a>
## fetchExtra

```js
import { fetchExtra } from 'fetch-extra';
import { fetch } from 'fetch-extra';  /* or */
```

##### Syntax

> Promise\<Response\> fetchExtra(...options)

`...options` \<...String|Object|RequestExtra\>

- If `options` is a string, it is treated as a `URL`
- If `options` is a object, it is treated as `RequestExtra` options. Checkout below for detail. All [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) options are supported

Later `options` will similarly overwrite earlier ones.

##### Description

> The Fetch API provides an interface for fetching resources.

`fetchExtra` syntax adapts to [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API):

```js
import { fetchExtra } from 'fetch-extra';
(async function main() {
    const url = 'https://swapi.co/api/people/1/';
    const res = await fetchExtra(url, { method: 'GET' });
    const luke = await res.json();
    console.log(luke.name); /* Luke Skywalker */
}());
```

But there are some extra options.

```js
const res = await fetchExtra({
    url: 'https://swapi.co/api/people/1/',
    resolveType: 'json',
    timeout: 30000,
});
```

For more extra options and usages, please checkout below.


<a name="requestextra"></a>
## RequestExtra

```js
import { RequestExtra } from 'fetch-extra';
import { Request } from 'fetch-extra';  /* or */
```

##### Syntax

> \<RequestExtra\> new RequestExtra(...options)

`...options` \<...String|Object|RequestExtra\>

All options are the same with `fetchExtra`.

##### Description

> The Request interface of the Fetch API represents a resource request.

RequestExtra syntax also adapts to [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request).

```js
import { fetchExtra, RequestExtra } from 'fetch-extra';
(async function main() {
    const url = 'https://swapi.co/api/people/1/';
    const request = new RequestExtra(url);
    const res = await fetchExtra(request);
    const luke = await res.json();
}());
```

But there are some extra options and methods.


<a name="new-requestfetch-method"></a>
#### New `Request#fetch()` method

```js
const request = new RequestExtra(url);
const res = await request.fetch();
const luke = await res.json();
```

Fetching with options:

```js
const request = new RequestExtra(url);
const res = await request.fetch({ method: 'DELETE' });
const luke = await res.json();
```

<a name="enhanced-url-option"></a>
#### Enhanced `url` option

`URLs` could be composed.

```js
const baseUrl = 'https://swapi.co/api/';
const swRequest = new RequestExtra(baseUrl);

const lukeRes = await swRequest.fetch('/people/1/');
/* final URL will be "https://swapi.co/api/people/1/" */

const starShipRes = await swRequest.fetch('/starships/9/');
/* final URL will be "https://swapi.co/api/starships/9/" */
```

To override earlier URL, just give a new URL starts with a protocol (like `http://` or `https://`):

```js
const swRequest = new RequestExtra('https://swapi.co/', options);
const pokeRes = swRequest.fetch('https://pokeapi.co/api/v2/');
/* final URL will be "https://pokeapi.co/api/v2/" */
```

<a name="enhanced-requestcloneoptions-method"></a>
#### Enhanced `Request#clone(...options)` method

```js
const baseRequest = new RequestExtra({
    headers: { 'Content-Type': 'application/json' },
});

const swRequest = baseRequest.clone('https://swapi.co/api/');
const luke = await swRequest.fetch('/people/1/');
const c3po = await swRequest.fetch('/people/2/');

const pokeRequest = baseRequest.clone('https://pokeapi.co/api/v2/');
const bulbasaur = await pokeRequest.fetch('/pokemon/1/');
```

The `...options` usages are the same with `fetchExtra` or `RequestExtra`

<a name="new-resolvetype-option"></a>
#### New `resolveType` option

Returning resolved data with specified type instead of `response` object.

```js
const options = { resolveType: 'json' };
const luke = await swRequest.fetch(options); /* <-- no need `await res.json()` */
console.log(luke.name); /* Luke Skywalker */
```

In browser, `resolveType` value could be one of `arrayBuffer`, `blob`, `formData`, `json` or `text`.

In Node.js, `formData` is NOT supported.


<a name="new-query-option"></a>
#### New `query` option

```js
const results = await swRequest.fetch({ query: { search: 'luke' } });
/* final URL will be "https://swapi.co/api/people?search=luke" */
```

`query` could be JSON object or string (like `name=luke&height=172`).

If `url` has search fields (like `https://swapi.co/api/people?search=luke`), query string will append to the search fields.


<a name="enhanced-body-option"></a>
#### Enhanced `body` option

```js
const results = await swRequest.fetch({
    method: 'POST',
    body: { name: 'Luke Skywalker' }, /* <-- could be a JSON */
});
/* final body will be '{"name":"Luke Skywalker"}' */
```


<a name="new-type-option"></a>
#### New `type` option

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


<a name="new-simple-option"></a>
#### New `simple` option

Will throw error if `response` status is non-2xx.

```js
try {
    const results = await swRequest.fetch({
        simple: true,
        url: '/400', /* simulate response with 400 HTTP status */
    });
}
catch (err) {
    console.error(err); /* <-- Error: Bad Request  */
}
```


<a name="new-querytransformer-option"></a>
#### New `queryTransformer` option

```js
const baseRequest = new RequestExtra({
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
const baseRequest = new RequestExtra({
    async queryTransformer(query) { /* <-- queryTransformer */
        query.accessToken = await getTokenAsync(),
        return query;
    },
});
/* ... */
```


<a name="new-urltransformer-option"></a>
#### New `urlTransformer` option

Like `queryTransformer`, but transform `url`.


<a name="new-headerstransformer-option"></a>
#### New `headersTransformer` option

Like `queryTransformer`, but transform `headers`.


<a name="new-bodytransformer-option"></a>
#### New `bodyTransformer` option

Like `queryTransformer`, but transform `body`.


<a name="new-responsetransformer-option"></a>
#### New `responseTransformer` option

Transform [response](https://developer.mozilla.org/en-US/docs/Web/API/Response) instance.


```js
const baseRequest = new RequestExtra({
    resolveType: 'json',
    responseTransformer(response) { /* <-- responseTransformer */
        if (response.status === 404) {
            throw new Error('Page not found');
        }
        return response;
    },
});
/* ... */
```


<a name="new-responsedatatransformer-option"></a>
#### New `responseDataTransformer` option

Like `responseTransformer`, but transform the data after `resolveType` resolved.

```js
const baseRequest = new RequestExtra({
    resolveType: 'json',
    responseDataTransformer(json) { /* <-- responseDataTransformer */
        if (json) { json.fullName = `${json.firstName} ${json.familyName}`; }
        return json;
    },
});
/* ... */
```


<a name="new-errortransformer-option"></a>
#### New `errorTransformer` option

Transform error or rejection.

```js
const baseRequest = new RequestExtra({
    errorTransformer(error) { /* <-- errorTransformer */
        if (error.name === 'Abort') {
            console.warn('Fetch aborted');
        }
        return error;
    },
});
/* ... */
```

<a name="license"></a>
## License

MIT
