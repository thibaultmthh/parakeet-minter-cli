const path = require('path');

const nodeExternals = require('webpack-node-externals');
const JavaScriptObfuscator = require('webpack-obfuscator');

module.exports = {
	entry: './source/cli.tsx',
	// devtool: 'inline-source-map',
	externals: [nodeExternals(), function ({ context, request }, callback) {
		if (/settings/.test(request)) {
			// Externalize to a commonjs module using the request path
			return callback(null, 'commonjs ' + request);
		}

		// Continue without externalizing the import
		callback();
	}],
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: [/node_modules/],
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
		extensions: ['.tsx', '.ts'],
	},



	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'pre_build'),
	},
	target: "node"
};
