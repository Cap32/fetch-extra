/**
 * @jest-environment jsdom
 */

import 'whatwg-fetch';
import createFetch from '../src/';
import createAbortController from '../src/createAbortController';
import EventTarget from '../../fetch-extra/src/fetch-extra-browser/EventTarget';
import Event from '../../fetch-extra/src/fetch-extra-browser/Event';
import sharedSpecs from './sharedSpecs';

sharedSpecs(
	'node',
	createFetch({
		fetch: window.fetch,
		Request: window.Request,
		AbortController: createAbortController({ EventTarget, Event })
	})
);
