(module.exports = {
	'root': true,
	'plugins': [
		'standard',
		'dollar-sign',
		'jquery',
	],
	'env': {
		'browser': true,
		'commonjs': true,
		'es6': true,
		'node': true
	},
	'extends': [
		'eslint:recommended',
	],
	'globals': {
		'Atomics': 'readonly',
		'SharedArrayBuffer': 'readonly'
	},
	'parserOptions': {
		'ecmaVersion': 2018
	},
	'rules': {
		'indent': ['error', 'tab'],
		'quotes': ['error', 'single'],
		'linebreak-style': ['error', 'unix'],
		'curly': ['error', 'all'],
		'comma-dangle': 'off',
		'no-console': 'off',
		'no-process-exit': 'error',
		'no-template-curly-in-string': 'error',
		'require-await': 'off',
		'semi': ['error', 'never'],
	}
})
