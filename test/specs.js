
import assert from 'assert';
import { fetch, request } from '../src/index.js';

export default (host) => {
	describe('fetch', async function () {
		it('fetch(url)', async function () {
			fetch(`${host}/ok`);
		});

		it('response', async function () {
			const response = await fetch(`${host}/ok`);
			const json = await response.json();
			assert.deepEqual(json, { method: 'GET' });
		});

		it('method: POST', async function () {
			const res = await fetch(`${host}/ok`, { method: 'POST' });
			const json = await res.json();
			assert.deepEqual(json, { method: 'POST' });
		});

		it('method: PUT', async function () {
			const res = await fetch(`${host}/ok`, { method: 'PUT' });
			const json = await res.json();
			assert.deepEqual(json, { method: 'PUT' });
		});

		it('method: PATCH', async function () {
			const res = await fetch(`${host}/ok`, { method: 'PATCH' });
			const json = await res.json();
			assert.deepEqual(json, { method: 'PATCH' });
		});

		it('method: DELETE', async function () {
			const res = await fetch(`${host}/ok`, { method: 'DELETE' });
			const json = await res.json();
			assert.deepEqual(json, { method: 'DELETE' });
		});
	});

	describe('responseType', function () {
		it('responseType: json', async function () {
			const body = await fetch(`${host}/ok`, { responseType: 'json' });
			assert.deepEqual(body, { method: 'GET' });
		});

		it('responseType: text', async function () {
			const body = await fetch(`${host}/text`, { responseType: 'text' });
			assert(body === 'ok');
		});

		it('should not handle response while response.ok is false', async function () {
			const body = await fetch(`${host}/404`, { responseType: 'text' });
			assert(body !== 'ok');
		});
	});

	describe('client constructor', function () {
		it('constructor()', async function () {
			const client = request();
			assert(client instanceof request);
		});

		it('constructor() with url', async function () {
			const client = request(`${host}/ok`);
			const { url } = client.req;
			assert(url[0] === `${host}/ok`);
		});

		it('constructor() with options', async function () {
			const client = request({ url: `${host}/ok`, responseType: 'json', method: 'PUT' });
			const { url, method, responseType } = client.req;
			assert(url[0] === `${host}/ok`);
			assert(method === 'PUT');
			assert(responseType === 'json');
		});

		it('constructor() with url and options', async function () {
			const client = request(`${host}/ok`, { responseType: 'json', method: 'PUT' });
			const { url, method, responseType } = client.req;
			assert(url[0] === `${host}/ok`);
			assert(method === 'PUT');
			assert(responseType === 'json');
		});

		it('constructor() with another client', async function () {
			const baseClient = request({ responseType: 'json', method: 'PUT' });
			const client = request(baseClient);
			const { method, responseType } = client.req;
			assert(method === 'PUT');
			assert(responseType === 'json');
		});

		it('constructor() with options override', async function () {
			const baseClient = request({ responseType: 'json', method: 'PUT' });
			const client = request({ method: 'POST' }, baseClient);
			const { method } = client.req;
			assert(method === 'PUT');
		});
	});

	describe('client props', function () {
		it('client.req', async function () {
			const client = request();
			const { url, query, body, headers, method } = client.req;
			assert(method === 'GET');
			assert.deepEqual(headers, {});
			assert.deepEqual(body, {});
			assert(Array.isArray(query));
			assert(Array.isArray(url));
		});

		it('client.compose()', async function () {
			const url = `${host}/ok`;
			const method = 'POST';
			const query = { hello: 'world' };
			const client = request({ url, method, query });
			const options = await client.compose();
			assert(options.method === method);
			assert(options.url === `${url}?hello=world`);
		});

		it('client.fetch()', async function () {
			const client = request(`${host}/ok`, { responseType: 'json', method: 'POST' });
			const body = await client.fetch();
			assert.deepEqual(body, { method: 'POST' });
		});

		it('client.fetch() options override original options', async function () {
			const client = request(`${host}/ok`, { responseType: 'json', method: 'GET' });
			const body = await client.fetch({ method: 'POST' });
			assert.deepEqual(body, { method: 'POST' });
		});

		it('client.fetch() multiple times', async function () {
			const client = request(`${host}/ok`, { responseType: 'json', method: 'GET' });
			const body1 = await client.fetch({ method: 'POST' });
			assert.deepEqual(body1, { method: 'POST' });
			const body2 = await client.fetch();
			assert.deepEqual(body2, { method: 'GET' });
		});

		it('client.clone()', async function () {
			const client = request({ method: 'POST' });
			const cloned = client.clone();
			assert(cloned instanceof request);
			assert(cloned.req.method === 'POST');
			client.set('method', 'DELETE');
			assert(cloned.req.method === 'POST');
		});
	});

	describe('client.set', function () {
		it('client.set() with key and value', function () {
			const client = request().set('method', 'POST');
			const { method } = client.req;
			assert(method === 'POST');
		});

		it('client.set() with object', function () {
			const client = request().set({ method: 'POST' });
			const { method } = client.req;
			assert(method === 'POST');
		});

		it('client.set() with function', function () {
			const client = request({
				method: 'POST',
			}).set((req) => {
				assert(req.method === 'POST');
				req.method = 'PUT';
				return req;
			});
			const { method } = client.req;
			assert(method === 'PUT');
		});

		it('client.set() with another client', function () {
			const baseClient = request({ method: 'POST' });
			const client = request().set(baseClient);
			const { method } = client.req;
			assert(method === 'POST');
		});

		it('throw error is client.set() with invalid key', function () {
			assert.throws(() => {
				const baseClient = request();
				const client = request().set();
			});
		});
	});

	describe('url', function () {
		it('url string', async function () {
			const url = `${host}/foo/bar`;
			const client = request({ url });
			const composed = await client.compose();
			assert(composed.url === url);
		});

		it('url string ends with slash', async function () {
			const url = `${host}/foo/bar/`;
			const client = request({ url });
			const composed = await client.compose();
			assert(composed.url === url);
		});

		it('url string starts with slash', async function () {
			const url = '/foo/bar';
			const client = request({ url });
			const composed = await client.compose();
			assert(composed.url === url);
		});

		it('extends url', async function () {
			const client = request({ url: host }).set('url', '/foo/bar');
			const composed = await client.compose();
			assert(composed.url === `${host}/foo/bar`);
		});

		it('override url', async function () {
			const client = request({ url: 'http://google.com' })
				.set('url', host)
				.set('url', '/foo/bar')
			;
			const composed = await client.compose();
			assert(composed.url === `${host}/foo/bar`);
		});

		it('resolve url', async function () {
			const client = request({ url: host })
				.set('url', '/foo/bar/')
				.set('url', '../baz')
			;
			const composed = await client.compose();
			assert(composed.url === `${host}/foo/baz`);
		});

		it('modify url', async function () {
			const client = request({ url: host })
				.set('url', (urls) => urls.concat('/foo/bar'))
			;
			const composed = await client.compose();
			assert(composed.url === `${host}/foo/bar`);
		});
	});

	describe('query', function () {
		const url = 'http://localhost';

		it('query object', async function () {
			const client = request(url, { query: { hello: 'world' } });
			const composed = await client.compose();
			const composedUrl = composed.url;
			assert(composedUrl === `${url}?hello=world`);
		});

		it('query string', async function () {
			const client = request(url, { query: 'hello=world' });
			const composed = await client.compose();
			const composedUrl = composed.url;
			assert(composedUrl === `${url}?hello=world`);
		});

		it('query mixed', async function () {
			const client = request(url, { query: 'hello=world' })
				.set('query', { it: 'works' })
			;
			const composed = await client.compose();
			const composedUrl = composed.url;
			assert(
				composedUrl === `${url}?hello=world&it=works` ||
				composedUrl === `${url}?it=works&hello=world`
			);
		});

		it('modify query', async function () {
			const client = request(url, { query: 'hello=world' })
				.set('query', () => [{ hello: 'chris' }])
			;
			const composed = await client.compose();
			const composedUrl = composed.url;
			assert(composedUrl === `${url}?hello=chris`);
		});

		it('extends url search', async function () {
			const client = request(`${url}?foo=bar`, { query: 'hello=world' })
				.set('query', () => [{ hello: 'chris' }])
			;
			const composed = await client.compose();
			const composedUrl = composed.url;
			assert(composedUrl === `${url}?foo=bar&hello=chris`);
		});
	});

	describe('headers', function () {
		const url = 'http://localhost';

		it('headers', async function () {
			const client = request(url, { headers: { hello: 'world' } });
			const composed = await client.compose();
			const { headers } = composed;
			assert.deepEqual(headers, { hello: 'world' });
		});

		it('extends headers', async function () {
			const client = request(url, { headers: { hello: 'world' } })
				.set('headers', { it: 'works' })
			;
			const composed = await client.compose();
			const { headers } = composed;
			assert.deepEqual(headers, { hello: 'world', it: 'works' });
		});

		it('override headers', async function () {
			const client = request(url, { headers: { hello: 'world' } })
				.set('headers', { hello: 'chris' })
			;
			const composed = await client.compose();
			const { headers } = composed;
			assert.deepEqual(headers, { hello: 'chris' });
		});

		it('modify headers', async function () {
			const client = request(url, { headers: { hello: 'world' } })
				.set('headers', (headers) => {
					headers.hello = 'chris';
					headers.it = 'works';
					return headers;
				})
			;
			const composed = await client.compose();
			const { headers } = composed;
			assert.deepEqual(headers, { hello: 'chris', it: 'works' });
		});

		it('headers with type: json', async function () {
			const client = request(url, { headers: { hello: 'world' }, type: 'json' });
			const composed = await client.compose();
			const { headers } = composed;
			assert.deepEqual(headers, {
				hello: 'world',
				'Content-Type': 'application/json',
			});
		});

		it('headers with type: form', async function () {
			const client = request(url, { headers: { hello: 'world' }, type: 'form' });
			const composed = await client.compose();
			const { headers } = composed;
			assert.deepEqual(headers, {
				hello: 'world',
				'Content-Type': 'application/x-www-form-urlencoded',
			});
		});

		it('headers with custom type', async function () {
			const client = request(url, { type: 'foo' });
			const composed = await client.compose();
			const { headers } = composed;
			assert.deepEqual(headers, { 'Content-Type': 'foo' });
		});
	});

	describe('body', function () {
		const url = 'http://localhost';
		const method = 'POST';

		it('body', async function () {
			const client = request({
				url,
				method,
				body: { hello: 'world' },
			});
			const composed = await client.compose();
			const { body } = composed;
			assert.deepEqual(body, { hello: 'world' });
		});

		it('extends body', async function () {
			const client = request({
				url,
				method,
				body: { hello: 'world' },
			}).set('body', { it: 'works' });
			const composed = await client.compose();
			const { body } = composed;
			assert.deepEqual(body, { hello: 'world', it: 'works' });
		});

		it('override body', async function () {
			const client = request({
				url,
				method,
				body: { hello: 'world' },
			}).set('body', { hello: 'chris' });
			const composed = await client.compose();
			const { body } = composed;
			assert.deepEqual(body, { hello: 'chris' });
		});

		it('modify body', async function () {
			const client = request({
				url,
				method,
				body: { hello: 'world' }
			}).set('body', (body) => {
				body.hello = 'chris';
				body.it = 'works';
				return body;
			});
			const composed = await client.compose();
			const { body } = composed;
			assert.deepEqual(body, { hello: 'chris', it: 'works' });
		});

		it('body with type: json', async function () {
			const client = request({
				url,
				method,
				body: { hello: 'world' },
				type: 'json',
			});
			const composed = await client.compose();
			const { body } = composed;
			assert(body === JSON.stringify({ hello: 'world' }));
		});

		it('body with type: form', async function () {
			const client = request({
				url,
				method,
				body: { hello: 'world' },
				type: 'form',
			});
			const composed = await client.compose();
			const { body } = composed;
			assert(body === 'hello=world');
		});
	});

	describe('timeout', function () {
		it('should timeout', async function () {
			return fetch(`${host}/delay`, { timeout: 1 })
				.then(() => assert(false))
				.catch(() => assert(true))
			;
		});
	});

	describe('simple', function () {
		it('should not throw error is `response.ok: true`', async function () {
			return fetch(`${host}/ok`, { simple: true })
				.then(() => assert(true))
				.catch((err) => assert(false))
			;
		});

		it('should throw error if `response.ok: false`', async function () {
			return fetch(`${host}/404`, { simple: true })
				.then(() => assert(false))
				.catch((err) => assert(err.status === 404))
			;
		});

		it('should contain a reponse object if fetch failed', async function () {
			return fetch(`${host}/404`, { simple: true })
				.then(() => assert(false))
				.catch((err) => assert(typeof err.response === 'object'))
			;
		});
	});

	describe('error', function () {
		it('should throw error if missing url', async function () {
			return fetch()
				.then(() => assert(false))
				.catch(assert)
			;
		});

		it('should throw error if fetch failed', async function () {
			return fetch('http://localhost:1')
				.then(() => assert(false))
				// .catch((err) => assert(err.name === 'FetchError', err.message))
				.catch((err) => assert(err))
			;
		});

		it('should throw error if transformer failed', async function () {
			const message = 'Failed to transform url';
			return fetch({
					url: `${host}/ok`,
					urlTransformer: () => { throw new Error(message); }
				})
				.then(() => assert(false))
				.catch((err) => assert(err.message === message))
			;
		});
	});

	describe('transformers', function () {

		describe('url transformer', function () {
			it('urlTransformer option', async function () {
				const client = request({
					url: `${host}/foo/bar`,
					urlTransformer: (url) => url + '/baz',
				});
				const composed = await client.compose();
				assert(composed.url === `${host}/foo/bar/baz`);
			});

			it('addUrlTransformer', async function () {
				const client = request({ url: `${host}/foo/bar` });
				client.addUrlTransformer((url) => url + '/baz');
				const composed = await client.compose();
				assert(composed.url === `${host}/foo/bar/baz`);
			});
		});

		describe('query transformer', function () {
			it('queryTransformer option', async function () {
				const client = request(host, {
					query: { foo: 'bar' },
					queryTransformer: (query) => Object.assign(query, { baz: 'qux' }),
				});
				const composed = await client.compose();
				assert(composed.url === `${host}?foo=bar&baz=qux`);
			});

			it('addUrlTransformer', async function () {
				const client = request(host, { query: { foo: 'bar' } });
				client.addQueryTransformer((query) => Object.assign(query, { baz: 'qux' }));
				const composed = await client.compose();
				assert(composed.url === `${host}?foo=bar&baz=qux`);
			});
		});

		describe('body transformer', function () {
			it('bodyTransformer option', async function () {
				const client = request({
					url: 'http://localhost',
					method: 'POST',
					body: { hello: 'world' },
					bodyTransformer: (body) => Object.assign(body, { it: 'works' })
				});
				const composed = await client.compose();
				assert.deepEqual(composed.body, { hello: 'world', it: 'works' });
			});

			it('addBodyTransformer', async function () {
				const client = request({
					url: 'http://localhost',
					method: 'POST',
					body: { hello: 'world' },
				});
				client.addBodyTransformer((body) => Object.assign(body, {
					it: 'works',
				}));
				const composed = await client.compose();
				assert.deepEqual(composed.body, { hello: 'world', it: 'works' });
			});
		});

		describe('headers transformer', function () {
			it('headersTransformer option', async function () {
				const client = request({
					url: 'http://localhost',
					headers: { hello: 'world' },
					headersTransformer: (headers) => Object.assign(headers, { it: 'works', }),
				});
				const composed = await client.compose();
				assert.deepEqual(composed.headers, { hello: 'world', it: 'works' });
			});

			it('addHeadersTransformer', async function () {
				const client = request('http://localhost', { headers: { hello: 'world' } });
				client.addHeadersTransformer((headers) => Object.assign(headers, {
					it: 'works',
				}));
				const composed = await client.compose();
				assert.deepEqual(composed.headers, { hello: 'world', it: 'works' });
			});
		});

		describe('error transformer', function () {
			it('errorTransformer option', async function () {
				const client = request({
					url: 'http://localhost:1',
					errorTransformer: (err) => Object.assign(err, { name: 404 }),
				});
				return client
					.fetch()
					.then(() => assert(false))
					.catch((err) => assert(err.name === 404))
				;
			});

			it('addErrorTransformer', async function () {
				const client = request('http://localhost:1');
				client.addErrorTransformer((err) => Object.assign(err, { name: 404 }));
				return client
					.fetch()
					.then(() => assert(false))
					.catch((err) => assert(err.name === 404))
				;
			});
		});

		describe('response transformer', function () {
			it('responseTransformer option', async function () {
				const client = await request({
					url: `${host}/ok`,
					responseTransformer: (res) => Object.assign(res, { foo: 'bar' }),
				});
				const res = await client.fetch();
				assert(res.foo === 'bar');
			});

			it('addResponseTransformer', async function () {
				const client = await request(`${host}/ok`);
				client.addResponseTransformer(
					(res) => Object.assign(res, { foo: 'bar' }),
				);
				const res = await client.fetch();
				assert(res.foo === 'bar');
			});
		});

		describe('responseData transformer', function () {
			it('responseDataTransformer option', async function () {
				const client = await request({
					url: `${host}/ok`,
					responseType: 'json',
					responseDataTransformer: (json) => Object.assign(json, { foo: 'bar' }),
				});
				const json = await client.fetch();
				assert.deepEqual(json, { foo: 'bar', method: 'GET' });
			});

			it('addResponseDataTransformer', async function () {
				const client = await request(`${host}/ok`, { responseType: 'json' });
				client.addResponseDataTransformer((json) => Object.assign(json, { foo: 'bar' }));
				const json = await client.fetch();
				assert.deepEqual(json, { foo: 'bar', method: 'GET' });
			});
		});

		describe('transformer behaviours', function () {
			it('add multiple transformers', async function () {
				const client = request({ url: `${host}/foo/bar` });
				client.addUrlTransformer((url) => url + '/baz');
				client.addUrlTransformer((url) => url.replace('foo', 'qux'));
				const composed = await client.compose();
				assert(composed.url === `${host}/qux/bar/baz`);
			});

			it('remove transformer', async function () {
				const client = request({ url: `${host}/foo/bar` });
				const urlTransformer = (url) => url + '/baz';
				client.addUrlTransformer(urlTransformer);
				client.addUrlTransformer((url) => url.replace('foo', 'qux'));
				client.removeUrlTransformer(urlTransformer);
				const composed = await client.compose();
				assert(composed.url === `${host}/qux/bar`);
			});

			it('transformers should be able to inherit', async function () {
				const baseClient = request({ url: `${host}/foo/bar` });
				baseClient.addUrlTransformer((url) => url + '/baz');
				const client = request(baseClient);
				client.addUrlTransformer((url) => url.replace('foo', 'qux'));
				const composed = await client.compose();
				assert(composed.url === `${host}/qux/bar/baz`);
			});

			it('transformers should be isolated', async function () {
				const baseClient = request({ url: `${host}/foo/bar` });
				const urlTransformer = (url) => url + '/baz';
				baseClient.addUrlTransformer(urlTransformer);
				const client = request(baseClient);
				client.removeUrlTransformer(urlTransformer);
				client.addUrlTransformer((url) => url + '/quux');
				baseClient.addUrlTransformer((url) => url.replace('foo', 'qux'));
				const baseComposed = await baseClient.compose();
				assert(baseComposed.url === `${host}/qux/bar/baz`);
				const composed = await client.compose();
				assert(composed.url === `${host}/foo/bar/quux`);
			});
		});
	});
};

describe('custom qs library', function () {
	it('custom qs', async function () {
		const client = request({
			url: '/',
			method: 'POST',
			body: { hello: 'world' },
			type: 'form',
			query: {
				hello: 'world',
			},
			queryTransformer(query) {
				assert.deepEqual(query, { baz: 'qux' });
				return query;
			},
			qsLib: {
				stringify() {
					return 'foo=bar';
				},
				parse() {
					return { baz: 'qux' };
				},
			},
		});
		const composed = await client.compose();
		const { body } = composed;
		assert(body === 'foo=bar', 'body');
	});
});

