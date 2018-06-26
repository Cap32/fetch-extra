/**
 * @jest-environment node
 */

import createFetch from '../src/';
import createAbortController from '../src/createAbortController';
import nodeFetch from 'node-fetch';
import EventTarget from '../../fetch-extra/src/fetch-extra-node/EventTarget';
import Event from '../../fetch-extra/src/fetch-extra-node/Event';
import sharedSpecs from './sharedSpecs';

sharedSpecs(
	'node',
	createFetch({
		fetch: nodeFetch,
		Request: nodeFetch.Request,
		AbortController: createAbortController({ EventTarget, Event })
	})
);
