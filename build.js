const buble = require('rollup-plugin-buble');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const es3 = require('rollup-plugin-es3');
const uglify = require('rollup-plugin-uglify');
const filesize = require('rollup-plugin-filesize');

const presets = {
	umd: {
		suffix: 'umd',
		format: 'umd'
	},
	min: {
		suffix: 'min',
		format: 'umd',
		plugins: [
			uglify({ compress: { pure_funcs: ['Object.defineProperty'] } }),
			filesize()
		]
	}
};

module.exports = function createConfig({ name, libName, target }) {
	const config = presets[target];
	return {
		input: `src/${name}-browser/index.js`,
		output: {
			file: `dist/${name}-${config.suffix}.js`,
			format: config.format,
			intro: config.intro,
			name: libName,
			sourcemap: config.sourcemap
		},
		plugins: [resolve(), commonjs(), es3(), buble()].concat(
			config.plugins || []
		),
		external: config.external || []
	};
};
