import createFetch from 'fetch-extra-core';
import createAbortController from 'fetch-extra-core/lib/createAbortController';
import EventTarget from './EventTarget';
import Event from './Event';

export default createFetch({
	fetch: window.fetch,
	Request: window.Request,
	AbortController: createAbortController({ EventTarget, Event })
});
