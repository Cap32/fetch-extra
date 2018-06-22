/**
 * @jest-environment jsdom
 */

import 'whatwg-fetch';
import fetch from '../src/fetch-extra-browser';
import sharedSpecs from './sharedSpecs';

sharedSpecs('browser', fetch);
