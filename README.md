# fetch-extra

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


## Table of Content
<!-- MarkdownTOC -->

- [Installation](#installation)
- [fetchExtra](#fetchextra)
    - [The same usage with fetch:](#the-same-usage-with-fetch)
    - [New `resolveType` option:](#new-resolvetype-option)
- [RequestExtra](#requestextra)
    - [The same usage with Request:](#the-same-usage-with-request)
    - [New `Request#fetch()` method](#new-requestfetch-method)
    - [New `Query` option](#new-query-option)
    - [Composing URL](#composing-url)
    - [Enhanced `Request#clone()` method](#enhanced-requestclone-method)
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
#### The same usage with [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API):

```js
import { fetchExtra } from 'fetch-extra';
(async function main() {
    const url = 'https://swapi.co/api/people/1/';
    const res = await fetchExtra(url);
    const luke = await res.json();
    console.log(luke.name); /* Luke Skywalker */
}());
```

<a name="new-resolvetype-option"></a>
#### New `resolveType` option:

```js
const luke = await fetchExtra(url, { resolveType: 'json' });
console.log(luke.name); /* Luke Skywalker */
```

<a name="requestextra"></a>
## RequestExtra

> The Request interface of the Fetch API represents a resource request.

<a name="the-same-usage-with-request"></a>
#### The same usage with [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request):

```js
import { fetchExtra, RequestExtra } from 'fetch-extra';
(async function main() {
    const url = 'https://swapi.co/api/people/1/';
    const request = RequestExtra(url);
    const res = await fetchExtra(request);
    const luke = await res.json();
}());
```

<a name="new-requestfetch-method"></a>
#### New `Request#fetch()` method

```js
const request = new RequestExtra(url, { resolveType: 'json' });
const luke = await request.fetch();
```

###### with fetching options

```js
const request = new RequestExtra(url, { resolveType: 'json' });
const luke = await request.fetch({ method: 'DELETE' });
```


<a name="new-query-option"></a>
#### New `Query` option

```js
const url = 'https://swapi.co/api/people';
const request = new RequestExtra(url, { resolveType: 'json' });
const results = await request.fetch({ query: { search: 'luke' } });
/* final URL will be "https://swapi.co/api/people?search=luke" */
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

const pokeRequest = baseRequest.clone('https://pokeapi.co/api/v2/');
const bulbasaur = await pokeRequest.fetch('/pokemon/1/');
```

<a name="api-references"></a>
## API References

*TODO*


<a name="license"></a>
## License

MIT
