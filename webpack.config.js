const path = require('path');

const nodeExternals = require('webpack-node-externals');
const JavaScriptObfuscator = require('webpack-obfuscator');

module.exports = {
	entry: './source/cli.tsx',
	// devtool: 'inline-source-map',
	externals: [nodeExternals()],
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
		],
	},
	plugins: [
		new JavaScriptObfuscator({
			rotateStringArray: true,
			stringArray: true,
			identifiersPrefix: "fuck_u_mf"
		})
	],
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
	},
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'build'),
	},
	target: "node"
};
