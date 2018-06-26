const build = require('../../build');

module.exports = build({
	name: 'fetch-extra',
	libName: 'fetchExtra',
	target: process.env.BUILD_TARGET
});
