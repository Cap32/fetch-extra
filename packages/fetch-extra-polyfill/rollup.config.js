const build = require('../../build');

module.exports = build({
	input: 'src/browser.js',
	name: 'fetchExtraPolyfill',
	target: process.env.BUILD_TARGET
});
