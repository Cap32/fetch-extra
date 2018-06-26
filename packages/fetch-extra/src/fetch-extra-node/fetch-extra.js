import createFetch from 'fetch-extra-core';
import createAbortController from 'fetch-extra-core/lib/createAbortController';
import nodeFetch from 'node-fetch';
import EventTarget from './EventTarget';
import Event from './Event';

export default createFetch({
	fetch: nodeFetch,
	Request: nodeFetch.Request,
	AbortController: createAbortController({ EventTarget, Event })
});
