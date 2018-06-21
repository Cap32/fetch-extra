import nodeFetch from 'node-fetch';
import createFetch from './fetch-extra-core';

export default createFetch(nodeFetch);
