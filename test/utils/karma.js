
import { createServer } from './server';
import { Server } from 'karma';
import { resolve } from 'path';

createServer((host) => {
	new Server({
		configFile: resolve(__dirname, '../../karma.conf.js'),
		// singleRun: false,
		client: {
			args: [host],
		},
	}).start();
});
