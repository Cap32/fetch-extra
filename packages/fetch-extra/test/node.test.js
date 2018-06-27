/**
 * @jest-environment node
 */

import Event from '../src/fetch-extra-node/Event';
import EventTarget from '../src/fetch-extra-node/EventTarget';
import sharedSpecs from './sharedSpecs';

sharedSpecs('node', Event, EventTarget);
