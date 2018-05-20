const buble = require('rollup-plugin-buble');
const resolve = require('rollup-plugin-node-resolve');
const es3 = require('rollup-plugin-es3');
const alias = require('rollup-plugin-alias');
const json = require('rollup-plugin-json');
const commonjs = require('rollup-plugin-commonjs');
const uglify = require('rollup-plugin-uglify');
const filesize = require('rollup-plugin-filesize');
const builtins = require('rollup-plugin-node-builtins');
const pkg = require('./package.json');

const presets = {
	browser: {
		file: 'lib/fetch-extra-browser.js',
		format: 'cjs',
		external: Object.keys(pkg.dependencies).filter(dep => dep !== 'node-fetch'),
		plugins: [alias({ 'node-fetch': './fetch' })]
	},
	umd: {
		file: 'lib/fetch-extra-umd.js',
		format: 'umd',
		plugins: [alias({ 'node-fetch': './fetch' })]
	},
	min: {
		file: 'lib/fetch-extra-min.js',
		format: 'umd',
		plugins: [
			alias({ 'node-fetch': './fetch' }),
			uglify({ output: { comments: false } }),
			filesize()
		]
	},
	karma: {
		format: 'iife',
		sourcemap: 'inline',
		plugins: [
			alias({ 'node-fetch': './fetch' }),
			builtins(),
			json(),
			commonjs()
		]
	}
};

module.exports = function createConfig(preset) {
	const config = presets[preset];
	return {
		input: 'src/index.js',
		output: {
			file: config.file,
			format: config.format,
			name: 'fetchExtra',
			sourcemap: config.sourcemap
		},
		plugins: (config.plugins || []).concat([resolve(), buble(), es3()]),
		external: config.external || []
	};
};