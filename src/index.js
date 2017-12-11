
import * as qs from 'tiny-querystring';

const { assign } = Object;
const isString = (target) => typeof target === 'string';
const isFunction = (target) => typeof target === 'function';
const isObject = (target) => typeof target === 'object';

const fetch = typeof window === 'object' ? (self || window).fetch : require('node-fetch');

const ContentTypes = {
	form: 'application/x-www-form-urlencoded',
	json: 'application/json',
};

const ErrorNames = {
	timeout: 'TimeoutError',
};

const parseUrl = function parseUrl(url) {
	const markIndex = (url += '').indexOf('?');
	if (~markIndex) {
		return {
			path: url.substr(0, markIndex),
			queryObj: qs.parse(url.substr(markIndex + 1)),
		};
	}
	return { path: url, queryObj: {} };
};

const checkCouldHaveBody = function checkCouldHaveBody(method = '') {
	return !~['GET', 'HEAD'].indexOf(method.toUpperCase());
};

const resolveUrls = function resolveUrls(urls) {
	const paths = [];
	const separateBySlash = function separateBySlash(str) {
		const list = str.split('/').filter((path) => path && path !== '.');
		paths.push.apply(paths, list);
	};
	urls = urls.filter(Boolean);
	if (!urls.length) { throw new Error('Missing url'); }
	urls.forEach((url) => {
		const protocolIndex = url.indexOf('://');
		if (protocolIndex > -1) {
			paths.length = 0;
			paths.push(url.substr(0, protocolIndex) + ':/');
			separateBySlash(url.substr(protocolIndex + 3));
		}
		else {
			separateBySlash(url);
		}
	});
	const resolvedUrl = paths
		.reduce((list, path) => {
			if (path === '..' && list.length) { list.pop(); }
			else if (path !== '.') { list.push(path); }
			return list;
		}, [])
		.join('/')
	;
	const isLastSlash = urls[urls.length - 1].substr(-1) === '/';
	return isLastSlash ? (resolvedUrl + '/') : resolvedUrl;
};

const composeURL = function composeURL(url, queries) {
	const queryStr = queries
		.reduce((list, query) => {
			list.push(isObject(query) ? qs.stringify(query) : query);
			return list;
		}, [])
		.join('&')
	;
	const urlPrefix = resolveUrls(url);
	const sep = ~urlPrefix.indexOf('?') ? '&' : '?';
	return queryStr ? (urlPrefix + sep + queryStr) : urlPrefix;
};

const composeBody = function composeBody(body, headers) {
	const contentType = headers['Content-Type'];
	if (body && !isString(body)) {
		if (contentType === ContentTypes.json) {
			return JSON.stringify(body);
		}
		else if (contentType === ContentTypes.form) {
			return qs.stringify(body);
		}
	}
	return body;
};

const composeHeaders = function composeHeaders(headers, type) {
	if (type) { headers['Content-Type'] = ContentTypes[type] || type; }
	return headers;
};

const compose = function compose(request) {
	try {
		const { type, url, query, body, headers, ...options } = request.req;
		const composedHeaders = composeHeaders(headers, type);
		const composedBody = composeBody(body, composedHeaders);
		const composedURL = composeURL(url, query);
		const { path, queryObj } = parseUrl(composedURL);
		const couldHaveBody = checkCouldHaveBody(options.method);
		const promises = [
			request._applyQueryTransformer(queryObj),
			request._applyUrlTransformer(path),
			request._applyHeadersTransformer(composedHeaders),
		];
		if (couldHaveBody) {
			promises.push(request._applyBodyTransformer(composedBody));
		}
		return Promise.all(promises).then(([queryObj, path, headers, body]) => {
			const query = qs.stringify(queryObj);
			const url = path + (query ? `?${query}` : '');
			const res = { url, headers, ...options };
			if (couldHaveBody) { res.body = body; }
			return res;
		});
	}
	catch (err) {
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
	'Query', 'Url', 'Body', 'Headers', 'Response', 'ResponseData', 'Error',
];

const RequestExtra = function RequestExtra(...args) {
	if (!(this instanceof RequestExtra)) {
		return new RequestExtra(...args);
	}

	this.req = {
		url: [],
		query: [],
		body: {},
		headers: {},
		method: 'GET',
	};
	this.transformers = {};
	TransformerHooks.forEach((hook) => (this.transformers[hook] = []));
	this._from(...args);
};

assign(RequestExtra.prototype, {
	_from(...args) {
		args.forEach((arg) => {
			if (isString(arg)) { this.set('url', arg); }
			else if (isObject(arg)) { this.set(arg); }
		});
	},
	_cloneTransformers(transformers) {
		TransformerHooks.forEach((hook) => {
			this.transformers[hook].push(...transformers[hook]);
		});
	},
	set(maybeKey, val) {
		if (maybeKey instanceof RequestExtra) {
			const instance = maybeKey;
			this.set(instance.req);
			this._cloneTransformers(instance.transformers);
		}
		else if (isFunction(maybeKey)) {
			const modify = maybeKey;
			modify(this.req);
		}
		else if (isString(maybeKey)) {
			const key = maybeKey;

			if (key.slice(-11) === 'Transformer') {
				const hook = key.charAt(0).toUpperCase() + key.slice(1, -11);
				const transformer = this.transformers[hook];
				transformer.push.apply(transformer, [].concat(val));
			}
			else {
				const { req } = this;
				const prev = req[key];
				const arrKeys = ['url', 'query'];
				if (isFunction(val)) {
					req[key] = val(prev, req, key);
				}
				else if (~arrKeys.indexOf(key)) {
					prev.push.apply(prev, [].concat(val));
				}
				else if (isObject(prev) && isObject(val)) {
					assign(prev, val);
				}
				else {
					req[key] = val;
				}
			}
		}
		else if (isObject(maybeKey)) {
			const obj = maybeKey;
			Object.keys(obj).forEach((key) => this.set(key, obj[key]));
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
		return compose(request)
			.then((options) => {
				const { responseType, timeout, simple } = options;
				const shouldResolve = (res) => responseType && res && res.ok !== false;
				const fetchPromise = fetch(options.url, options)
					.then((res) => request._applyResponseTransformer(res))
					.then((res) => simple ? handleSimple(res) : res)
					.then((res) => shouldResolve(res) ? res[responseType]() : res)
					.then((res) => request._applyResponseDataTransformer(res))
				;
				const promises = [fetchPromise];
				if (timeout) {
					promises.push(new Promise((resolve, reject) => {
						setTimeout(() => {
							const timeoutError = new Error('Timeout');
							timeoutError.name = ErrorNames.timeout;
							reject(timeoutError);
						}, timeout);
					}));
				}
				return Promise.race(promises);
			})
			.catch((err) =>
				request._applyErrorTransformer(err).then((e) => Promise.reject(e))
			)
		;
	},
});

TransformerHooks.forEach((hook) => {
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

const requestExtra = new RequestExtra();
const fetchExtra = requestExtra.fetch.bind(requestExtra);
RequestExtra.fetch = fetchExtra;

export default fetchExtra;
export const request = RequestExtra;
export { fetchExtra, RequestExtra };
