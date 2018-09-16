import { createServer, closeServer } from './utils/server';
import createAbortController from '../src/createAbortController';
import delay from 'delay';

export default function sharedSpecs(name, fetch) {
	const { request, AbortController, AbortError, TimeoutError } = fetch;

	describe(name, () => {
		let host;

		beforeAll(async () => {
			host = await createServer();
		});

		afterAll(closeServer);

		describe('fetch', async () => {
			test('fetch(url)', async () => {
				fetch(`${host}/ok`);
			});

			test('response', async () => {
				const response = await fetch(`${host}/ok`);
				const json = await response.json();
				expect(json).toEqual({ method: 'GET' });
			});

			test('method: POST', async () => {
				const res = await fetch(`${host}/ok`, { method: 'POST' });
				const json = await res.json();
				expect(json).toEqual({ method: 'POST' });
			});

			test('method: PUT', async () => {
				const res = await fetch(`${host}/ok`, { method: 'PUT' });
				const json = await res.json();
				expect(json).toEqual({ method: 'PUT' });
			});

			test('method: PATCH', async () => {
				const res = await fetch(`${host}/ok`, { method: 'PATCH' });
				const json = await res.json();
				expect(json).toEqual({ method: 'PATCH' });
			});

			test('method: DELETE', async () => {
				const res = await fetch(`${host}/ok`, { method: 'DELETE' });
				const json = await res.json();
				expect(json).toEqual({ method: 'DELETE' });
			});
		});

		describe('responseType', () => {
			test('responseType: json', async () => {
				const body = await fetch(`${host}/ok`, { responseType: 'json' });
				expect(body).toEqual({ method: 'GET' });
			});

			test('responseType: text', async () => {
				const body = await fetch(`${host}/text`, { responseType: 'text' });
				expect(body).toBe('ok');
			});

			test('should not handle response while response.ok is false', async () => {
				const body = await fetch(`${host}/404`, { responseType: 'text' });
				expect(body).not.toBe('ok');
			});

			test('should not handle response while response type is not supported', async () => {
				const res = await fetch(`${host}/ok`, { responseType: 'foo' });
				expect(res).toMatchObject({ ok: true, status: 200 });
			});

			test('should not handle response while response type is "none"', async () => {
				const res = await fetch(`${host}/ok`, { responseType: 'none' });
				expect(res).toMatchObject({ ok: true, status: 200 });
			});
		});

		describe('client constructor', () => {
			test('constructor()', async () => {
				const client = request();
				expect(client).toBeInstanceOf(request);
			});

			test('constructor() with url', async () => {
				const client = request(`${host}/ok`);
				const { url } = client.req;
				expect(url[0]).toBe(`${host}/ok`);
			});

			test('constructor() with options', async () => {
				const client = request({
					url: `${host}/ok`,
					responseType: 'json',
					method: 'PUT'
				});
				const { url, method, responseType } = client.req;
				expect(url[0]).toBe(`${host}/ok`);
				expect(method).toBe('PUT');
				expect(responseType).toBe('json');
			});

			test('constructor() with url and options', async () => {
				const client = request(`${host}/ok`, {
					responseType: 'json',
					method: 'PUT'
				});
				const { url, method, responseType } = client.req;
				expect(url[0]).toBe(`${host}/ok`);
				expect(method).toBe('PUT');
				expect(responseType).toBe('json');
			});

			test('constructor() with another client', async () => {
				const baseClient = request({ responseType: 'json', method: 'PUT' });
				const client = request(baseClient);
				const { method, responseType } = client.req;
				expect(method).toBe('PUT');
				expect(responseType).toBe('json');
			});

			test('constructor() with options override', async () => {
				const baseClient = request({ responseType: 'json', method: 'PUT' });
				const client = request({ method: 'POST' }, baseClient);
				const { method } = client.req;
				expect(method).toBe('PUT');
			});
		});

		describe('client props', () => {
			test('client.req', async () => {
				const client = request();
				const { url, query, body, headers, method } = client.req;
				expect(method).toBe('GET');
				expect(headers).toEqual({});
				expect(body).toEqual(undefined);
				expect(Array.isArray(query)).toBe(true);
				expect(Array.isArray(url)).toBe(true);
			});

			test('client.compose()', async () => {
				const url = `${host}/ok`;
				const method = 'POST';
				const query = { hello: 'world' };
				const client = request({ url, method, query });
				const options = await client.compose();
				expect(options.method).toBe(method);
				expect(options.url).toBe(`${url}?hello=world`);
			});

			test('client.fetch()', async () => {
				const client = request(`${host}/ok`, {
					responseType: 'json',
					method: 'POST'
				});
				const body = await client.fetch();
				expect(body).toEqual({ method: 'POST' });
			});

			test('client.fetch() options override original options', async () => {
				const client = request(`${host}/ok`, {
					responseType: 'json',
					method: 'GET'
				});
				const body = await client.fetch({ method: 'POST' });
				expect(body).toEqual({ method: 'POST' });
			});

			test('client.fetch() multiple times', async () => {
				const client = request(`${host}/ok`, {
					responseType: 'json',
					method: 'GET'
				});
				const body1 = await client.fetch({ method: 'POST' });
				expect(body1).toEqual({ method: 'POST' });
				const body2 = await client.fetch();
				expect(body2).toEqual({ method: 'GET' });
			});

			test('client.clone()', async () => {
				const client = request({ method: 'POST' });
				const cloned = client.clone();
				expect(cloned).toBeInstanceOf(request);
				expect(cloned.req.method).toBe('POST');
				client.set('method', 'DELETE');
				expect(cloned.req.method).toBe('POST');
			});
		});

		describe('client.set', () => {
			test('client.set() with key and value', () => {
				const client = request().set('method', 'POST');
				const { method } = client.req;
				expect(method).toBe('POST');
			});

			test('client.set() with object', () => {
				const client = request().set({ method: 'POST' });
				const { method } = client.req;
				expect(method).toBe('POST');
			});

			test('client.set() with function', () => {
				const client = request({
					method: 'POST'
				}).set(req => {
					expect(req.method).toBe('POST');
					req.method = 'PUT';
					return req;
				});
				const { method } = client.req;
				expect(method).toBe('PUT');
			});

			test('client.set() with another client', () => {
				const baseClient = request({ method: 'POST' });
				const client = request().set(baseClient);
				const { method } = client.req;
				expect(method).toBe('POST');
			});

			test('throw error is client.set() with invalid key', () => {
				expect(() => request().set()).toThrow();
			});

			test('client.set() with invalid function type', () => {
				const client = request().set('foo', () => 'bar');
				const { foo } = client.req;
				expect(foo).not.toBe('bar');
			});
		});

		describe('url', () => {
			test('url string', async () => {
				const url = `${host}/foo/bar`;
				const client = request({ url });
				const composed = await client.compose();
				expect(composed.url).toBe(url);
			});

			test('url string ends with slash', async () => {
				const url = `${host}/foo/bar/`;
				const client = request({ url });
				const composed = await client.compose();
				expect(composed.url).toBe(url);
			});

			test('url string equals "/"', async () => {
				const url = '/';
				const client = request({ url });
				const composed = await client.compose();
				expect(composed.url).toBe(url);
			});

			test('url string starts with slash', async () => {
				const url = '/foo/bar';
				const client = request({ url });
				const composed = await client.compose();
				expect(composed.url).toBe(url);
			});

			test('extends url', async () => {
				const client = request({ url: host }).set('url', '/foo/bar');
				const composed = await client.compose();
				expect(composed.url).toBe(`${host}/foo/bar`);
			});

			test('override url', async () => {
				const client = request({ url: 'http://google.com' })
					.set('url', host)
					.set('url', '/foo/bar');
				const composed = await client.compose();
				expect(composed.url).toBe(`${host}/foo/bar`);
			});

			test('resolve url', async () => {
				const client = request({ url: host })
					.set('url', '/foo/bar/')
					.set('url', '../baz');
				const composed = await client.compose();
				expect(composed.url).toBe(`${host}/foo/baz`);
			});

			test('modify url', async () => {
				const client = request({ url: host }).set('url', urls =>
					urls.concat('/foo/bar')
				);
				const composed = await client.compose();
				expect(composed.url).toBe(`${host}/foo/bar`);
			});
		});

		describe('query', () => {
			const url = 'http://localhost';

			test('query object', async () => {
				const client = request(url, { query: { hello: 'world' } });
				const composed = await client.compose();
				const composedUrl = composed.url;
				expect(composedUrl).toBe(`${url}?hello=world`);
			});

			test('query string', async () => {
				const client = request(url, { query: 'hello=world' });
				const composed = await client.compose();
				const composedUrl = composed.url;
				expect(composedUrl).toBe(`${url}?hello=world`);
			});

			test('query mixed', async () => {
				const client = request(url, { query: 'hello=world' }).set('query', {
					it: 'works'
				});
				const composed = await client.compose();
				const composedUrl = composed.url;
				expect(
					composedUrl === `${url}?hello=world&it=works` ||
						composedUrl === `${url}?it=works&hello=world`
				).toBe(true);
			});

			test('modify query', async () => {
				const client = request(url, { query: 'hello=world' }).set(
					'query',
					() => [{ hello: 'chris' }]
				);
				const composed = await client.compose();
				const composedUrl = composed.url;
				expect(composedUrl).toBe(`${url}?hello=chris`);
			});

			test('extends url search', async () => {
				const client = request(`${url}?foo=bar`, { query: 'hello=world' }).set(
					'query',
					() => [{ hello: 'chris' }]
				);
				const composed = await client.compose();
				const composedUrl = composed.url;
				expect(composedUrl).toBe(`${url}?foo=bar&hello=chris`);
			});
		});

		describe('headers', () => {
			const url = 'http://localhost';

			test('headers', async () => {
				const client = request(url, { headers: { hello: 'world' } });
				const composed = await client.compose();
				const { headers } = composed;
				expect(headers).toEqual({ hello: 'world' });
			});

			test('extends headers', async () => {
				const client = request(url, { headers: { hello: 'world' } }).set(
					'headers',
					{ it: 'works' }
				);
				const composed = await client.compose();
				const { headers } = composed;
				expect(headers).toEqual({ hello: 'world', it: 'works' });
			});

			test('override headers', async () => {
				const client = request(url, { headers: { hello: 'world' } }).set(
					'headers',
					{ hello: 'chris' }
				);
				const composed = await client.compose();
				const { headers } = composed;
				expect(headers).toEqual({ hello: 'chris' });
			});

			test('modify headers', async () => {
				const client = request(url, { headers: { hello: 'world' } }).set(
					'headers',
					headers => {
						headers.hello = 'chris';
						headers.it = 'works';
						return headers;
					}
				);
				const composed = await client.compose();
				const { headers } = composed;
				expect(headers).toEqual({ hello: 'chris', it: 'works' });
			});

			test('headers with type: json', async () => {
				const client = request(url, {
					headers: { hello: 'world' },
					type: 'json'
				});
				const composed = await client.compose();
				const { headers } = composed;
				expect(headers).toEqual({
					hello: 'world',
					'Content-Type': 'application/json'
				});
			});

			test('headers with type: form', async () => {
				const client = request(url, {
					headers: { hello: 'world' },
					type: 'form'
				});
				const composed = await client.compose();
				const { headers } = composed;
				expect(headers).toEqual({
					hello: 'world',
					'Content-Type': 'application/x-www-form-urlencoded'
				});
			});

			test('headers with custom type', async () => {
				const client = request(url, { type: 'foo' });
				const composed = await client.compose();
				const { headers } = composed;
				expect(headers).toEqual({ 'Content-Type': 'foo' });
			});
		});

		describe('body', () => {
			const url = 'http://localhost';
			const method = 'POST';

			test('body', async () => {
				const client = request({
					url,
					method,
					body: { hello: 'world' }
				});
				const composed = await client.compose();
				const { body } = composed;
				expect(body).toEqual({ hello: 'world' });
			});

			test('extends body', async () => {
				const client = request({
					url,
					method,
					body: { hello: 'world' }
				}).set('body', { it: 'works' });
				const composed = await client.compose();
				const { body } = composed;
				expect(body).toEqual({ hello: 'world', it: 'works' });
			});

			test('override body', async () => {
				const client = request({
					url,
					method,
					body: { hello: 'world' }
				}).set('body', { hello: 'chris' });
				const composed = await client.compose();
				const { body } = composed;
				expect(body).toEqual({ hello: 'chris' });
			});

			test('modify body', async () => {
				const client = request({
					url,
					method,
					body: { hello: 'world' }
				}).set('body', body => {
					body.hello = 'chris';
					body.it = 'works';
					return body;
				});
				const composed = await client.compose();
				const { body } = composed;
				expect(body).toEqual({ hello: 'chris', it: 'works' });
			});

			test('body with type: json', async () => {
				const client = request({
					url,
					method,
					body: { hello: 'world' },
					type: 'json'
				});
				const composed = await client.compose();
				const { body } = composed;
				expect(body).toBe(JSON.stringify({ hello: 'world' }));
			});

			test('body with type: form', async () => {
				const client = request({
					url,
					method,
					body: { hello: 'world' },
					type: 'form'
				});
				const composed = await client.compose();
				const { body } = composed;
				expect(body).toBe('hello=world');
			});
		});

		describe('timeout', () => {
			test('should timeout', async () => {
				await expect(
					fetch(`${host}/delay`, { timeout: 1 })
				).rejects.toThrowError(new TimeoutError().message);
			});

			test('should not timeout', async () => {
				const options = { timeout: 1000 };
				await expect(fetch(`${host}/ok`, options)).resolves.not.toThrow();
			});
		});

		describe('simple', () => {
			test('should not throw error is `response.ok: true`', async () => {
				await expect(
					fetch(`${host}/ok`, { simple: true })
				).resolves.not.toThrow();
			});

			test('should throw error if `response.ok: false`', async () => {
				await expect(fetch(`${host}/404`, { simple: true })).rejects.toThrow();
			});

			test('should contain a reponse object if fetch failed', async () => {
				await expect(fetch(`${host}/404`, { simple: true })).rejects.toThrow(
					expect.objectContaining({
						response: expect.any(Object)
					})
				);
			});
		});

		describe('error', () => {
			test('should throw error if missing url', async () => {
				await expect(fetch()).rejects.toThrow();
			});

			test('should throw error if fetch failed', async () => {
				await expect(fetch('http://localhost:1')).rejects.toThrow();
			});

			test('should throw error if transformer failed', async () => {
				const message = 'Failed to transform url';
				await expect(
					fetch({
						url: `${host}/ok`,
						urlTransformer: () => {
							throw new Error(message);
						}
					})
				).rejects.toThrow(
					expect.objectContaining({
						message
					})
				);
			});
		});

		describe('transformers', () => {
			describe('url transformer', () => {
				test('urlTransformer option', async () => {
					const client = request({
						url: `${host}/foo/bar`,
						urlTransformer: url => url + '/baz'
					});
					const composed = await client.compose();
					expect(composed.url).toBe(`${host}/foo/bar/baz`);
				});

				test('addUrlTransformer', async () => {
					const client = request({ url: `${host}/foo/bar` });
					client.addUrlTransformer(url => url + '/baz');
					const composed = await client.compose();
					expect(composed.url).toBe(`${host}/foo/bar/baz`);
				});
			});

			describe('query transformer', () => {
				test('queryTransformer option', async () => {
					const client = request(host, {
						query: { foo: 'bar' },
						queryTransformer: query => Object.assign(query, { baz: 'qux' })
					});
					const composed = await client.compose();
					expect(composed.url).toBe(`${host}?foo=bar&baz=qux`);
				});

				test('addUrlTransformer', async () => {
					const client = request(host, { query: { foo: 'bar' } });
					client.addQueryTransformer(query =>
						Object.assign(query, { baz: 'qux' })
					);
					const composed = await client.compose();
					expect(composed.url).toBe(`${host}?foo=bar&baz=qux`);
				});
			});

			describe('body transformer', () => {
				test('bodyTransformer option', async () => {
					const client = request({
						url: 'http://localhost',
						method: 'POST',
						body: { hello: 'world' },
						bodyTransformer: body => Object.assign(body, { it: 'works' })
					});
					const composed = await client.compose();
					expect(composed.body).toEqual({ hello: 'world', it: 'works' });
				});

				test('addBodyTransformer', async () => {
					const client = request({
						url: 'http://localhost',
						method: 'POST',
						body: { hello: 'world' }
					});
					client.addBodyTransformer(body =>
						Object.assign(body, {
							it: 'works'
						})
					);
					const composed = await client.compose();
					expect(composed.body).toEqual({ hello: 'world', it: 'works' });
				});
			});

			describe('headers transformer', () => {
				test('headersTransformer option', async () => {
					const client = request({
						url: 'http://localhost',
						headers: { hello: 'world' },
						headersTransformer: headers =>
							Object.assign(headers, { it: 'works' })
					});
					const composed = await client.compose();
					expect(composed.headers).toEqual({ hello: 'world', it: 'works' });
				});

				test('addHeadersTransformer', async () => {
					const client = request('http://localhost', {
						headers: { hello: 'world' }
					});
					client.addHeadersTransformer(headers =>
						Object.assign(headers, {
							it: 'works'
						})
					);
					const composed = await client.compose();
					expect(composed.headers).toEqual({ hello: 'world', it: 'works' });
				});
			});

			describe('error transformer', () => {
				test('errorTransformer option', async () => {
					const client = request({
						url: 'http://localhost:1',
						errorTransformer: err => Object.assign(err, { name: 404 })
					});
					await expect(client.fetch()).rejects.toThrow(
						expect.objectContaining({
							name: 404
						})
					);
				});

				test('addErrorTransformer', async () => {
					const client = request('http://localhost:1');
					client.addErrorTransformer(err => Object.assign(err, { name: 404 }));
					await expect(client.fetch()).rejects.toThrow(
						expect.objectContaining({
							name: 404
						})
					);
				});
			});

			describe('response transformer', () => {
				test('responseTransformer option', async () => {
					const client = await request({
						url: `${host}/ok`,
						responseTransformer: res => Object.assign(res, { foo: 'bar' })
					});
					const res = await client.fetch();
					expect(res.foo).toBe('bar');
				});

				test('addResponseTransformer', async () => {
					const client = await request(`${host}/ok`);
					client.addResponseTransformer(res =>
						Object.assign(res, { foo: 'bar' })
					);
					const res = await client.fetch();
					expect(res.foo).toBe('bar');
				});
			});

			describe('responseData transformer', () => {
				test('responseDataTransformer option', async () => {
					const client = await request({
						url: `${host}/ok`,
						responseType: 'json',
						responseDataTransformer: json => Object.assign(json, { foo: 'bar' })
					});
					const json = await client.fetch();
					expect(json).toEqual({ foo: 'bar', method: 'GET' });
				});

				test('addResponseDataTransformer', async () => {
					const client = await request(`${host}/ok`, { responseType: 'json' });
					client.addResponseDataTransformer(json =>
						Object.assign(json, { foo: 'bar' })
					);
					const json = await client.fetch();
					expect(json).toEqual({ foo: 'bar', method: 'GET' });
				});
			});

			describe('transformer behaviours', () => {
				test('add multiple transformers', async () => {
					const client = request({ url: `${host}/foo/bar` });
					client.addUrlTransformer(url => url + '/baz');
					client.addUrlTransformer(url => url.replace('foo', 'qux'));
					const composed = await client.compose();
					expect(composed.url).toBe(`${host}/qux/bar/baz`);
				});

				test('remove transformer', async () => {
					const client = request({ url: `${host}/foo/bar` });
					const urlTransformer = url => url + '/baz';
					client.addUrlTransformer(urlTransformer);
					client.addUrlTransformer(url => url.replace('foo', 'qux'));
					client.removeUrlTransformer(urlTransformer);
					const composed = await client.compose();
					expect(composed.url).toBe(`${host}/qux/bar`);
				});

				test('transformers should be able to inherit', async () => {
					const baseClient = request({ url: `${host}/foo/bar` });
					baseClient.addUrlTransformer(url => url + '/baz');
					const client = request(baseClient);
					client.addUrlTransformer(url => url.replace('foo', 'qux'));
					const composed = await client.compose();
					expect(composed.url).toBe(`${host}/qux/bar/baz`);
				});

				test('transformers should be isolated', async () => {
					const baseClient = request({ url: `${host}/foo/bar` });
					const urlTransformer = url => url + '/baz';
					baseClient.addUrlTransformer(urlTransformer);
					const client = request(baseClient);
					client.removeUrlTransformer(urlTransformer);
					client.addUrlTransformer(url => url + '/quux');
					baseClient.addUrlTransformer(url => url.replace('foo', 'qux'));
					const baseComposed = await baseClient.compose();
					expect(baseComposed.url).toBe(`${host}/qux/bar/baz`);
					const composed = await client.compose();
					expect(composed.url).toBe(`${host}/foo/bar/quux`);
				});
			});
		});

		describe('custom qs library', () => {
			test('queryStringify', async () => {
				const client = request({
					url: '/',
					method: 'POST',
					body: { hello: 'world' },
					type: 'form',
					queryStringify: () => 'foo=bar'
				});
				const composed = await client.compose();
				expect(composed.body).toBe('foo=bar');
			});

			test('queryParse', async () => {
				const client = request({
					url: '/',
					query: { hello: 'world' },
					queryTransformer(query) {
						expect(query).toEqual({ foo: 'bar' });
						return query;
					},
					queryParse: () => ({ foo: 'bar' })
				});
				const composed = await client.compose();
				expect(composed.url).toBe('/?foo=bar');
			});

			test('queryStringify should be function type', async () => {
				expect(() => request({ queryStringify: 'foo' })).toThrow();
			});

			test('queryParse should be function type', async () => {
				expect(() => request({ queryParse: 'foo' })).toThrow();
			});
		});

		describe('abort', () => {
			test('abort', async () => {
				const abortController = new AbortController();
				const { signal } = abortController;
				const promise = fetch(`${host}/delay`, { signal });
				await delay(10);
				abortController.abort();
				await expect(promise).rejects.toThrowError(new AbortError().message);
			});

			test('aborted signal', async () => {
				const abortController = new AbortController();
				abortController.abort();
				const { signal } = abortController;
				await expect(fetch(`${host}/delay`, { signal })).rejects.toThrowError(
					new AbortError().message
				);
			});
		});

		describe('AbortController', () => {
			test('createAbortController()', async () => {
				const FakeAbortController = () => {};
				expect(
					createAbortController({ AbortController: FakeAbortController })
				).toBe(FakeAbortController);
			});

			test('AbortController', async () => {
				const abortController = new AbortController();
				expect(abortController).toMatchObject({
					signal: expect.objectContaining({
						aborted: expect.any(Boolean),
						addEventListener: expect.any(Function),
						removeEventListener: expect.any(Function),
						dispatchEvent: expect.any(Function)
					}),
					abort: expect.any(Function)
				});
			});

			test('abortSignal.addEventListener()', async () => {
				const abortController = new AbortController();
				const { signal } = abortController;
				const listener = jest.fn();
				signal.addEventListener('abort', listener);
				abortController.abort();
				abortController.abort();
				expect(listener).toHaveBeenCalledTimes(1);
			});

			test('abortSignal.removeEventListener()', async () => {
				const abortController = new AbortController();
				const { signal } = abortController;
				const listener = jest.fn();
				signal.addEventListener('abort', listener);
				signal.removeEventListener('abort', listener);
				abortController.abort();
				expect(listener).not.toBeCalled();
			});

			test('abortSignal.onabort', async () => {
				const abortController = new AbortController();
				const { signal } = abortController;
				const listener = jest.fn();
				signal.onabort = listener;
				abortController.abort();
				abortController.abort();
				expect(listener).toHaveBeenCalledTimes(1);
			});

			test('overriding abortSignal.onabort', async () => {
				const abortController = new AbortController();
				const { signal } = abortController;
				const listener1 = jest.fn();
				const listener2 = jest.fn();
				signal.onabort = listener1;
				expect(typeof signal.onabort).toBe('function');
				signal.onabort = listener2;
				abortController.abort();
				expect(listener1).toHaveBeenCalledTimes(0);
				expect(listener2).toHaveBeenCalledTimes(1);
			});

			test('setting onabort on an aborted signal', async () => {
				const abortController = new AbortController();
				const { signal } = abortController;
				abortController.abort();
				const listener = jest.fn();
				signal.onabort = listener;
				abortController.abort();
				expect(listener).toHaveBeenCalledTimes(0);
			});
		});
	});
}
