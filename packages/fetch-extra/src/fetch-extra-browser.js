import createFetch from './fetch-extra-core';
import AbortError from './Abort/AbortError';
import createAbortController from './Abort/createAbortController';
import EventTarget from './Abort/EventTarget';
import createAbortEvent from './Abort/createAbortEvent';

export default createFetch({
	fetch: window.fetch,
	Request: window.Request,
	AbortController: createAbortController(EventTarget, createAbortEvent),
	AbortError
});
