/**
 * @jest-environment node
 */

import Event from '../src/node/Event';
import EventTarget from '../src/node/EventTarget';
import sharedSpecs from './sharedSpecs';

sharedSpecs('node', Event, EventTarget);
