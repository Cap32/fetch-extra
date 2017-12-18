# fetch-extra

[![Build Status](https://travis-ci.org/Cap32/fetch-extra.svg?branch=master)](https://travis-ci.org/Cap32/fetch-extra)
[![Coverage Status](https://coveralls.io/repos/github/Cap32/fetch-extra/badge.svg?branch=master)](https://coveralls.io/github/Cap32/fetch-extra?branch=master)
[![dependencies Status](https://david-dm.org/cap32/fetch-extra/status.svg)](https://david-dm.org/cap32/fetch-extra)
[![License](https://img.shields.io/badge/license-MIT_License-blue.svg?style=flat)](https://github.com/Cap32/fetch-extra/blob/master/LICENSE)

Extra features for whatwg fetch and Request, including:

- Added query option
- Body could be json object
- Could resolve json (or text, buffer, etc) instead of response object
- Support Node.js
- Added timeout option
- Enhanced `Resquest#clone()`
- Added `Resquest#fetch()`
- Support transformers
- And so on...


## Table of Contents
<!-- MarkdownTOC -->

- [Installation](#installation)
- [fetchExtra](#fetchextra)
    - [The same usage with fetch](#the-same-usage-with-fetch)
    - [Extra options](#extra-options)
- [RequestExtra](#requestextra)
    - [The same usage with Request](#the-same-usage-with-request)
    - [New `Request#fetch()` method](#new-requestfetch-method)
    - [New `resolveType` option](#new-resolvetype-option)
    - [Composing URL](#composing-url)
    - [Enhanced `Request#clone()` method](#enhanced-requestclone-method)
    - [New `query` option](#new-query-option)
    - [Enhanced `body` option](#enhanced-body-option)
    - [New `type` option](#new-type-option)
    - [Transformers](#transformers)
- [API References](#api-references)
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

<a name="the-same-usage-with-fetch"></a>
#### The same usage with [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

```js
import { fetchExtra } from 'fetch-extra';
(async function main() {
    const url = 'https://swapi.co/api/people/1/';
    const res = await fetchExtra(url);
    const luke = await res.json();
    console.log(luke.name); /* Luke Skywalker */
}());
```

<a name="extra-options"></a>
#### Extra options

```js
const res = await fetchExtra({
    url: 'https://swapi.co/api/people/1/',
    resolveType: 'json',
    timeout: 30000,
});
```

For more extra options, please checkout the API References.




<a name="requestextra"></a>
## RequestExtra

> The Request interface of the Fetch API represents a resource request.

<a name="the-same-usage-with-request"></a>
#### The same usage with [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request)

```js
import { fetchExtra, RequestExtra } from 'fetch-extra';
(async function main() {
    const url = 'https://swapi.co/api/people/1/';
    const request = new RequestExtra(url, { method: 'DELETE' });
    const res = await fetchExtra(request);
    const luke = await res.json();
}());
```

<a name="new-requestfetch-method"></a>
#### New `Request#fetch()` method

```js
const request = new RequestExtra(url);
const res = await request.fetch();
const luke = await res.json();
```

###### with fetching options

```js
const request = new RequestExtra(url);
const res = await request.fetch({ method: 'DELETE' });
const luke = await res.json();
```

<a name="new-resolvetype-option"></a>
#### New `resolveType` option

```js
const request = new RequestExtra(url, { resolveType: 'json' });
const luke = await request.fetch(); /* <-- no need `await res.json()` */
console.log(luke.name); /* Luke Skywalker */
```


<a name="composing-url"></a>
#### Composing URL

```js
const baseUrl = 'https://swapi.co/api/';
const swRequest = new RequestExtra(baseUrl, { resolveType: 'json' });

const luke = await swRequest.fetch('/people/1/');
/* final URL will be "https://swapi.co/api/people/1/" */

const starShip = await swRequest.fetch('/starships/9/');
/* final URL will be "https://swapi.co/api/starships/9/" */
```


<a name="enhanced-requestclone-method"></a>
#### Enhanced `Request#clone()` method

```js
const baseRequest = new RequestExtra({ resolveType: 'json' });

const swRequest = baseRequest.clone('https://swapi.co/api/');
const luke = await swRequest.fetch('/people/1/');
const c3po = await swRequest.fetch('/people/2/');

const pokeRequest = baseRequest.clone('https://pokeapi.co/api/v2/');
const bulbasaur = await pokeRequest.fetch('/pokemon/1/');
```


<a name="new-query-option"></a>
#### New `query` option

```js
const results = await swRequest.fetch({ query: { search: 'luke' } });
/* final URL will be "https://swapi.co/api/people?search=luke" */
```


<a name="enhanced-body-option"></a>
#### Enhanced `body` option

```js
const results = await swRequest.fetch({
    method: 'POST',
    body: { name: 'Luke Skywalker' },
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


<a name="transformers"></a>
#### Transformers

*TODO*


<a name="api-references"></a>
## API References

*TODO*


<a name="license"></a>
## License

MIT
