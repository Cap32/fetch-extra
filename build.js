const buble = require('rollup-plugin-buble');
const resolve = require('rollup-plugin-node-resolve');
const es3 = require('rollup-plugin-es3');
const uglify = require('rollup-plugin-uglify');
const filesize = require('rollup-plugin-filesize');

const presets = {
	umd: {
		file: 'lib/fetch-extra-umd.js',
		format: 'umd'
	},
	min: {
		file: 'lib/fetch-extra-min.js',
		format: 'umd',
		plugins: [uglify({ output: { comments: false } }), filesize()]
	}
};

module.exports = function createConfig({ input, name, target }) {
	const config = presets[target];
	return {
		input,
		output: {
			file: config.file,
			format: config.format,
			intro: config.intro,
			name,
			sourcemap: config.sourcemap
		},
		plugins: (config.plugins || []).concat([resolve(), buble(), es3()]),
		external: config.external || []
	};
};
