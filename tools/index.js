'use strict'

const fs = require('fs')
const construct = require('./construct')

module.exports = (cmd, mode) => {

	// Constructs a JS string to define the tools that will be provided.

	const toolsFile = construct(mode)
	if (cmd === 'build') {
		return toolsFile + 
		'\nsetTimeout(aro.testFns.runTests);'
	}
	if (cmd === 'run') {
		const requirePath = __dirname + '/aro-tools-run.js'
		fs.writeFileSync(requirePath, toolsFile)
		return requirePath
	}
}
