const build = require('../../build');

module.exports = build({
	name: 'fetch-extra-polyfill',
	libName: 'fetchExtraPolyfill',
	target: process.env.BUILD_TARGET
});
