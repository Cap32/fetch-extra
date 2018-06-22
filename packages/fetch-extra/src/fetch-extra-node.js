import nodeFetch from 'node-fetch';
import createFetch from './fetch-extra-core';
import AbortError from './Abort/AbortError';
import createAbortController from './Abort/createAbortController';
import EventTarget from './Abort/EventTargetNode';
import createAbortEvent from './Abort/createAbortEventNode';

export default createFetch({
	fetch: nodeFetch,
	Request: nodeFetch.Request,
	AbortController: createAbortController(EventTarget, createAbortEvent),
	AbortError
});
