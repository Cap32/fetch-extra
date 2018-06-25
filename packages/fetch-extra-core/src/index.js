import * as qs from 'tiny-querystring';

const { assign } = Object;
const isString = target => typeof target === 'string';
const isFunction = target => typeof target === 'function';
const isObject = target => typeof target === 'object';

const arrayTypeProps = ['url', 'query'];
const funcTypeProps = ['queryStringify', 'queryParse'];
const maybeFuncTypeProps = ['url', 'query', 'headers', 'body'];

const ContentTypes = {
	form: 'application/x-www-form-urlencoded',
	json: 'application/json'
};

const ErrorNames = {
	timeout: 'TimeoutError'
};

const parseUrl = function parseUrl(url, queryParse) {
	const markIndex = (url += '').indexOf('?');
	if (~markIndex) {
		return {
			path: url.substr(0, markIndex),
			queryObj: queryParse(url.substr(markIndex + 1))
		};
	}
	return { path: url, queryObj: {} };
};

const checkCouldHaveBody = function checkCouldHaveBody(method) {
	return !~['GET', 'HEAD'].indexOf(method.toUpperCase());
};

const resolveUrls = function resolveUrls(urls) {
	const paths = [];
	const getProtocolIndex = function getProtocolIndex(url) {
		return url.indexOf('://');
	};
	const separateBySlash = function separateBySlash(str) {
		const list = str.split('/').filter(path => path && path !== '.');
		paths.push.apply(paths, list);
	};
	urls = urls.filter(Boolean);
	if (!urls.length) {
		throw new Error('Missing url');
	}
	urls.forEach(url => {
		const protocolIndex = getProtocolIndex(url);
		if (protocolIndex > -1) {
			paths.length = 0;
			paths.push(url.substr(0, protocolIndex) + ':/');
			separateBySlash(url.substr(protocolIndex + 3));
		} else {
			separateBySlash(url);
		}
	});
	let resolvedUrl = paths
		.reduce((list, path) => {
			/* istanbul ignore else */
			if (path === '..' && list.length) {
				list.pop();
			} else if (path !== '.') {
				list.push(path);
			}

			return list;
		}, [])
		.join('/');
	const hasProtocol = ~getProtocolIndex(resolvedUrl);
	const isStartsWithSlash = !hasProtocol && urls[0].charAt(0) === '/';
	const isEndsWithSlash = urls[urls.length - 1].substr(-1) === '/';
	if (isStartsWithSlash) {
		resolvedUrl = '/' + resolvedUrl;
	}
	if (isEndsWithSlash) {
		resolvedUrl += '/';
	}
	if (resolvedUrl === '//') {
		resolvedUrl = '/';
	}
	return resolvedUrl;
};

const composeURL = function composeURL(url, queries, queryStringify) {
	const queryStr = queries
		.reduce((list, query) => {
			list.push(isObject(query) ? queryStringify(query) : query);
			return list;
		}, [])
		.join('&');
	const urlPrefix = resolveUrls(url);
	const sep = ~urlPrefix.indexOf('?') ? '&' : '?';
	return queryStr ? urlPrefix + sep + queryStr : urlPrefix;
};

const composeBody = function composeBody(body, headers, queryStringify) {
	const contentType = headers['Content-Type'];

	/* istanbul ignore else */
	if (body && !isString(body)) {
		if (contentType === ContentTypes.json) {
			return JSON.stringify(body);
		} else if (contentType === ContentTypes.form) {
			return queryStringify(body);
		}
	}

	return body;
};

const composeHeaders = function composeHeaders(headers, type) {
	if (type) {
		headers['Content-Type'] = ContentTypes[type] || type;
	}
	return headers;
};

const compose = function compose(request) {
	try {
		const {
			type,
			url,
			query,
			body,
			headers,
			method,
			queryStringify,
			queryParse
		} = request.req;
		const composedHeaders = composeHeaders(headers, type);
		const composedURL = composeURL(url, query, queryStringify);
		const { path, queryObj } = parseUrl(composedURL, queryParse);
		const couldHaveBody = checkCouldHaveBody(method);
		const promises = [
			request._applyQueryTransformer(queryObj),
			request._applyUrlTransformer(path),
			request._applyHeadersTransformer(composedHeaders)
		];
		if (couldHaveBody) {
			const composedBody = composeBody(body, composedHeaders, queryStringify);
			promises.push(request._applyBodyTransformer(composedBody));
		}
		return Promise.all(promises).then(ref => {
			const queryObj = ref[0];
			const path = ref[1];
			const headers = ref[2];
			const body = ref[3];
			const query = queryStringify(queryObj);
			const url = path + (query ? `?${query}` : '');
			const res = assign({}, request.req, { url, headers });
			if (couldHaveBody) {
				res.body = body;
			} else {
				delete res.body;
			}
			return res;
		});
	} catch (err) {
		return Promise.reject(err);
	}
};

const handleSimple = function handleSimple(response) {
	if (response && !response.ok) {
		const error = new Error('response is not ok');
		error.status = response.status;
		error.statusText = response.statusText;
		return Promise.reject(error);
	}
	return response;
};

const flow = function flow(val, fns, context) {
	const fn = fns.shift();
	return Promise.resolve(
		isFunction(fn) ? flow(fn.call(context, val), fns, context) : val
	);
};

const TransformerHooks = [
	'Query',
	'Url',
	'Body',
	'Headers',
	'Response',
	'ResponseData',
	'Error'
];

export default function fetchExtreCore({
	fetch,
	Request,
	AbortController,
	AbortError
}) {
	const supportNativeSignal = Request && 'signal' in Request.prototype;

	const RequestExtra = function RequestExtra(...args) {
		if (!(this instanceof RequestExtra)) {
			return new RequestExtra(...args);
		}

		this.req = {
			url: [],
			query: [],
			body: undefined,
			headers: {},
			method: 'GET',
			queryStringify: qs.stringify,
			queryParse: qs.parse
		};
		this.transformers = {};
		TransformerHooks.forEach(hook => (this.transformers[hook] = []));
		this._from(...args);
	};

	assign(RequestExtra.prototype, {
		_from(...args) {
			args.forEach(arg => {
				if (isString(arg)) {
					this.set('url', arg);
				} else {
					this.set(arg);
				}
			});
		},
		_cloneTransformers(transformers) {
			TransformerHooks.forEach(hook => {
				const list = this.transformers[hook];
				list.push.apply(list, transformers[hook]);
			});
		},
		set(maybeKey, val) {
			if (maybeKey instanceof RequestExtra) {
				const instance = maybeKey;
				this.set(instance.req);
				this._cloneTransformers(instance.transformers);
			} else if (isFunction(maybeKey)) {
				const modify = maybeKey;
				modify(this.req);
			} else if (isString(maybeKey)) {
				const key = maybeKey;
				const { req } = this;
				if (~funcTypeProps.indexOf(key)) {
					if (isFunction(val)) req[key] = val;
					else {
						throw new Error(
							`"${key}" should be a function, but received "${typeof value}"`
						);
					}
				} else if (key.slice(-11) === 'Transformer') {
					const hook = key.charAt(0).toUpperCase() + key.slice(1, -11);
					const transformer = this.transformers[hook];
					transformer.push.apply(transformer, [].concat(val));
				} else {
					const prev = req[key];
					if (isFunction(val)) {
						if (~maybeFuncTypeProps.indexOf(key)) {
							req[key] = val(prev, req, key);
						} else {
							console.warn(`Function type of prop "${key}" is NOT supported`);
						}
					} else if (~arrayTypeProps.indexOf(key)) {
						prev.push.apply(prev, [].concat(val));
					} else if (isObject(prev) && isObject(val)) {
						assign(prev, val);
					} else {
						req[key] = val;
					}
				}
			} else if (isObject(maybeKey)) {
				const obj = maybeKey;
				Object.keys(obj).forEach(key => this.set(key, obj[key]));
			} else {
				throw new Error(`Can NOT set key "${typeof maybeKey}"`);
			}
			return this;
		},
		clone(...args) {
			return new RequestExtra(this, ...args);
		},
		compose(...args) {
			const request = this.clone(...args);
			return compose(request);
		},
		fetch(...args) {
			const request = this.clone(...args);
			let response = null;
			return compose(request)
				.then(options => {
					const { responseType, timeout, simple, signal } = options;
					const shouldResolve = res => responseType && res && res.ok !== false;
					const setRes = function setRes(resolve) {
						return res => resolve((response = res));
					};
					const fetchPromise = fetch(options.url, options)
						.then(setRes(res => request._applyResponseTransformer(res)))
						.then(setRes(res => (simple ? handleSimple(res) : res)))
						.then(
							setRes(res => (shouldResolve(res) ? res[responseType]() : res))
						)
						.then(setRes(res => request._applyResponseDataTransformer(res)));
					const promises = [fetchPromise];
					if (timeout) {
						promises.push(
							new Promise((resolve, reject) => {
								setTimeout(() => {
									const timeoutError = new Error('Timeout');
									timeoutError.name = ErrorNames.timeout;
									reject(timeoutError);
								}, timeout);
							})
						);
					}
					if (isObject(signal) && !supportNativeSignal) {
						if (signal.aborted) promises.push(Promise.reject(new AbortError()));
						else {
							promises.push(
								new Promise((resolve, reject) => {
									signal.addEventListener('abort', () => {
										reject(new AbortError());
									});
								})
							);
						}
					}
					return Promise.race(promises);
				})
				.catch(err => {
					err.response = response;
					return request
						._applyErrorTransformer(err)
						.then(e => Promise.reject(e));
				});
		}
	});

	TransformerHooks.forEach(hook => {
		RequestExtra.prototype[`add${hook}Transformer`] = function (fn) {
			this.transformers[hook].push(fn);
			return this;
		};
		RequestExtra.prototype[`remove${hook}Transformer`] = function (fn) {
			const transformers = this.transformers[hook];
			const index = transformers.indexOf(fn);
			index > -1 && transformers.splice(index, 1);
			return this;
		};
		RequestExtra.prototype[`_apply${hook}Transformer`] = function (val) {
			return flow(val, this.transformers[hook], this);
		};
	});

	const defaultRequest = new RequestExtra();

	const fetchExtra = defaultRequest.fetch.bind(defaultRequest);
	fetchExtra.Request = fetchExtra.request = RequestExtra;
	fetchExtra.AbortController = AbortController;
	fetchExtra.AbortError = AbortError;
	return fetchExtra;
}
