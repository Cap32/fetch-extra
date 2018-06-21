const buble = require('rollup-plugin-buble');
const resolve = require('rollup-plugin-node-resolve');
const es3 = require('rollup-plugin-es3');
const json = require('rollup-plugin-json');
const commonjs = require('rollup-plugin-commonjs');
const uglify = require('rollup-plugin-uglify');
const filesize = require('rollup-plugin-filesize');
const builtins = require('rollup-plugin-node-builtins');

const presets = {
	umd: {
		file: 'lib/fetch-extra-polyfill-umd.js',
		format: 'umd',
		plugins: [commonjs()]
	},
	min: {
		file: 'lib/fetch-extra-polyfill-min.js',
		format: 'umd',
		plugins: [commonjs(), uglify({ output: { comments: false } }), filesize()]
	},
	karma: {
		format: 'iife',
		sourcemap: 'inline',
		plugins: [builtins(), json(), commonjs()]
	}
};

const config = presets[process.env.BUILD_TARGET];

module.exports = {
	input: 'src/browser.js',
	output: {
		file: config.file,
		format: config.format,
		name: 'fetchExtraPolyfill',
		sourcemap: config.sourcemap,
		globals: {
			fetchExtra: 'fetch-extra-browser'
		}
	},
	context: 'window',
	plugins: (config.plugins || []).concat([resolve(), buble(), es3()])
};
