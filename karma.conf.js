/* eslint-disable max-len */

const build = require('./build');

module.exports = (config) => {
	const configuration = {

		// base path that will be used to resolve all patterns (eg. files, exclude)
		basePath: 'test',


		// frameworks to use
		// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks: ['mocha'],


		// list of files / patterns to load in the browser
		files: [
			'browser.js',
			// 'lib/fetch-extra-browser.js',
			// { pattern: 'test/specs.js', watched: false }
		],


		// list of files to exclude
		exclude: [
		],


		// preprocess matching files before serving them to the browser
		// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
		// preprocessors: {
		// 	'browser.js': ['webpack'],
		// },
		preprocessors: {
			'browser.js': ['rollup'],
		},

		rollupPreprocessor: {
			...build('karma'),
			format: 'iife',
			intro: 'var global = window;',
			sourcemap: 'inline',
		},

		webpack: {
			entry: () => ({}),
			module: {
				rules: [
					{
						test: /\.js?$/,
						loader: 'babel-loader',
						options: {
							presets: [
								'stage-0',
								'es2015',
							],
							cacheDirectory: true,
							babelrc: false,
						},
					},
				],
			},
		},

		webpackMiddleware: { stats: 'errors-only' },


		// test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://npmjs.org/browse/keyword/karma-reporter
		reporters: ['mocha'],


		// web server port
		port: 9876,


		// enable / disable colors in the output (reporters and logs)
		colors: true,


		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_ERROR,


		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: true,


		// start these browsers
		// available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
		browsers: ['Chrome'],

		customLaunchers: {
			Chrome_travis_ci: {
				base: 'Chrome',
				flags: ['--no-sandbox']
			}
		},


		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		singleRun: true,

		// Concurrency level
		// how many browser should be started simultaneous
		concurrency: Infinity
	};

	if (process.env.TRAVIS) {
		configuration.browsers = ['Chrome_travis_ci'];
	}

	config.set(configuration);
};
