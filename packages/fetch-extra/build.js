const buble = require('rollup-plugin-buble');
const resolve = require('rollup-plugin-node-resolve');
const es3 = require('rollup-plugin-es3');
const alias = require('rollup-plugin-alias');
const json = require('rollup-plugin-json');
const commonjs = require('rollup-plugin-commonjs');
const uglify = require('rollup-plugin-uglify');
const filesize = require('rollup-plugin-filesize');
const builtins = require('rollup-plugin-node-builtins');

const presets = {
	umd: {
		file: 'lib/fetch-extra-umd.js',
		format: 'umd'
	},
	min: {
		file: 'lib/fetch-extra-min.js',
		format: 'umd',
		plugins: [uglify({ output: { comments: false } }), filesize()]
	},
	karma: {
		format: 'iife',
		sourcemap: 'inline',
		intro: 'var global = window;',
		plugins: [
			alias({ 'node-fetch': './whatwg-fetch.js' }),
			builtins(),
			json(),
			commonjs()
		]
	}
};

module.exports = function createConfig(preset) {
	const config = presets[preset];
	return {
		input: 'src/fetch-extra-browser',
		output: {
			file: config.file,
			format: config.format,
			intro: config.intro,
			name: 'fetchExtra',
			sourcemap: config.sourcemap
		},
		plugins: (config.plugins || []).concat([resolve(), buble(), es3()]),
		external: config.external || []
	};
};
