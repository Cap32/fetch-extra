const build = require('../../build');

module.exports = build({
	input: 'src/fetch-extra-browser',
	name: 'fetchExtra',
	target: process.env.BUILD_TARGET
});
