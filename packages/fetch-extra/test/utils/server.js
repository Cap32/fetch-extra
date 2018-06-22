import http from 'http';
import url from 'url';
import bodyParser from 'co-body';
import qs from 'qs';
import cors from 'cors';
import delay from 'delay';

export const server = http.createServer((req, res) => {
	const { method, headers, url: reqURL } = req;
	const { query: queryString, pathname } = url.parse(reqURL);
	const query = qs.parse(queryString);

	const end = (data, statusCode = 200) =>
		cors()(req, res, () => {
			res.writeHead(statusCode, { 'Content-Type': 'application/json' });
			res.end(JSON.stringify(data));
		});

	const routes = {
		'GET /ok': () => end({ method }),
		'POST /ok': () => end({ method }),
		'PUT /ok': () => end({ method }),
		'PATCH /ok': () => end({ method }),
		'DELETE /ok': () => end({ method }),
		'GET /query': () => end(query),
		'POST /json': () => bodyParser.json(req).then(end),
		'POST /form': () => bodyParser.form(req).then(end),
		'GET /headers': () => end(headers),
		'GET /delay': () => delay(100).then(() => end({ delay: 100 })),
		'GET /foo/bar': () => end({ pathname: '/foo/bar' }),
		'GET /400': () => end(null, 400),
		'GET /500': () => end(null, 400),
		'GET /text': () =>
			cors()(req, res, () => {
				res.writeHead(200, { 'Content-Type': 'text/html' });
				res.end('ok');
			})
	};

	const route = `${method} ${pathname}`;

	if (typeof routes[route] === 'function') {
		routes[route]();
	} else if (route.startsWith('OPTIONS')) {
		end(null, 204);
	} else {
		end(null, 404);
	}
});

export const createServer = async () => {
	return new Promise((resolve, reject) => {
		server.listen(err => {
			if (err) {
				reject(err);
			} else {
				const { port } = server.address();
				resolve(`http://127.0.0.1:${port}`);
			}
		});
	});
};

export const closeServer = async () => {
	return new Promise((resolve, reject) => {
		server.close(err => (err ? reject(err) : resolve()));
	});
};

export default server;
