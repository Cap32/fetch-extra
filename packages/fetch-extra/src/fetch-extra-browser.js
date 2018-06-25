import createFetch from 'fetch-extra-core';
import AbortError from 'fetch-extra-core/lib/Abort/AbortError';
import createAbortController from 'fetch-extra-core/lib/Abort/createAbortController';
import EventTarget from './browser/EventTarget';
import Event from './browser/Event';

export default createFetch({
	fetch: window.fetch,
	Request: window.Request,
	AbortController: createAbortController({ EventTarget, Event }),
	AbortError
});
