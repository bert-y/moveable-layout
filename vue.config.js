const path = require('path');
module.exports = {
	productionSourceMap: true,
	lintOnSave: true,
	pages: {
		index: {
			entry: 'examples/main.js',
			template: 'public/index.html',
			filename: 'index.html',
		},
	},
	configureWebpack: {
		resolve: {
			extensions: ['.js', '.vue'],
			alias: {
				'@': path.resolve(__dirname, 'examples'),
			},
		},
	},
};