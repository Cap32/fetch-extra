/**
 * @jest-environment jsdom
 */

import Event from '../src/browser/Event';
import EventTarget from '../src/browser/EventTarget';
import sharedSpecs from './sharedSpecs';

sharedSpecs('browser', Event, EventTarget);
