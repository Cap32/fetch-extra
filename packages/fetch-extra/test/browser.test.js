/**
 * @jest-environment jsdom
 */

import Event from '../src/fetch-extra-browser/Event';
import EventTarget from '../src/fetch-extra-browser/EventTarget';
import sharedSpecs from './sharedSpecs';

sharedSpecs('browser', Event, EventTarget);
