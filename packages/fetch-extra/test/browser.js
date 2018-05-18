
import specs from './specs';
import { name } from '../package.json';

const host = window.__karma__.config.args[0];

describe(name, () => specs(host, { isBrowser: true }));
