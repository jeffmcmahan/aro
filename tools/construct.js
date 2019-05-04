'use strict'

const include = require('./include')

module.exports = mode => {

	// Build a file that defines the appropriate globals.

	let file = ''
	file += include('__app__')
	file += include('protocheck')
	if (mode === 'dev') {
		file += include('increase-stack-ln')
		file += include('state')
		file += include('fn')
		file += include('checkers')
		file += include('test-fns')
	}

	// Indent the file.
	file = '\t' + file.trim().split('\n').join('\n\t')

	// Wrap and return.
	return (
		`;(() => {'use strict';\n\n`+
			`\tvar global = (1,eval)('this')\n\n` +
			file +
		'\n})();'
	)
}