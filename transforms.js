'use strict'

const path = require('path')
const fs = require('fs')
const directive = ('\'use aro\'')

const includeTests = (fname, file) => {
	
	// Find and include a *.test.js file, if present.
	
	try {
		const testFname = fname.slice(0,-3) + '.test.js'
		const testBasename = path.basename(testFname)
		fs.statSync(testFname) // Throws if inaccessible.
		file += `\nrequire('./${testBasename}')(module, module.exports)`
	} catch (e) {
		// No tests defined.
	}
	return file
}

const defineMain = file => {

	// Define the "main" variable in the root project file.

	if (file.match(/[\b\s]main\s*=/)) {
		return (
			file.replace(directive, directive + ';let main;') + 
			'\n;aro.__app__ = main'
		)
	}
	return file
}

const removeAroGlobals = file => {

	// Comment out the various Aro globals.

	return file
		.replace(/\b(param\s*?\()/g, '// $1')
		.replace(/\b(precon\s*?\()/g, '// $1')
		.replace(/\b(returns\s*?\()/g, '// $1')
		.replace(/\b(postcon\s*?\()/g, '// $1')
		.replace(/\bfn(\s*?)\(/g, '/*fn*/$1(')
}

const defineLocal = (mode, fname, file) => {

	// Defines the "local" variable and replaces "use aro" with "use strict".

	const gl = mode === 'dev' ? `aro.state.localVars['${fname}'] = ` : ''
	return file.replace(
		directive, 
		directive + `;const local = ${gl} {}`
	)
}

const prepareTestFile = (fname, file) => {

	// Define the local, assert, test, and mock variables. 

	const nonTestFname = fname.slice(0, -8) + '.js'
	const vars = (
		'\'use strict\';'+
		'const assert = require(\'assert\').strict;' +
		`const local = aro.state.localVars['${nonTestFname}'];` +
		'const {test, mock} = aro.testFns;'
	)
	// Enable exposure of the parent file's module/exports.
	return 'module.exports = (module, exports) => {'+ 
		file.replace('\'use aro\'', vars) + 
	'}'
}

const replaceDirective = file => file.replace(directive, '\'use strict\'')

exports.dev = (fname, file) => {

	// Include test files, define "test", "mock", "main", and "local" vars.

	if (fname.includes('/node_modules/')) {
		return exports.prod('', file)
	}
	if (fname.endsWith('.test.js')) {
		return prepareTestFile(fname, file)
	} else {
		file = includeTests(fname, file)
	}
	file = defineLocal('dev', fname, file)
	file = defineMain(file)
	file = replaceDirective(file)
	return file
}

exports.prod = (_, file) => {

	// Remove global function calls, "main", and "local" variables.

	file = removeAroGlobals(file)
	file = defineLocal('prod', '', file)
	file = defineMain(file)
	file = replaceDirective(file)
	return file
}