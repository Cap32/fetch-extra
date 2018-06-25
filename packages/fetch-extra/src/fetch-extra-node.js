import createFetch from 'fetch-extra-core';
import AbortError from 'fetch-extra-core/lib/Abort/AbortError';
import createAbortController from 'fetch-extra-core/lib/Abort/createAbortController';
import nodeFetch from 'node-fetch';
import EventTarget from './node/EventTarget';
import Event from './node/Event';

export default createFetch({
	fetch: nodeFetch,
	Request: nodeFetch.Request,
	AbortController: createAbortController({ EventTarget, Event }),
	AbortError
});
