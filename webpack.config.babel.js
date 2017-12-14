
import { resolve } from 'path';
import webpack from 'webpack';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const PROJECT_PATH = __dirname;
const inProject = (...args) => resolve(PROJECT_PATH, ...args);
const inSrc = inProject.bind(null, 'src');
const inTest = inProject.bind(null, 'test');
const srcDir = inSrc();
const testDir = inTest();

export default {
	entry: () => ({}),
	output: {
		library: 'fetchExtra',
		libraryTarget: 'umd',
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				include: [srcDir, testDir],
				loader: 'babel-loader',
				options: {
					presets: [
						['es2015', { modules: false }],
						'stage-0',
					],
					cacheDirectory: true,
					babelrc: false,
				},
			},
		],
		noParse: [
			inProject('node_modules', 'babel-core', 'browser.min.js')
		],
	},
	plugins: [
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
		}),
	],
	resolve: {
		modules: [srcDir, 'node_modules'],
		alias: {
			fetch: 'src/fetch',
		},
	},
	devtool: 'source-map',
};
