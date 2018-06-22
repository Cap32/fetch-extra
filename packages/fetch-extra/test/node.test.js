/**
 * @jest-environment node
 */

import fetch from '../src/fetch-extra-node';
import sharedSpecs from './sharedSpecs';

sharedSpecs('node', fetch);
