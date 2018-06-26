/**
 * @jest-environment node
 */

import Event from '../src/fetch-extra-browser/Event';
import EventTarget from '../src/fetch-extra-browser/EventTarget';
import sharedSpecs from './sharedSpecs';

sharedSpecs('node', Event, EventTarget);
