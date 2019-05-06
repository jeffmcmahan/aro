'use strict'

const path = require('path')

module.exports = (mode, file) => {

	// Setup globals that are always available.

	const toolsPath = require('./tools')('run', mode)
	require(toolsPath)
	require('./enhance-require')(mode)
	if (mode === 'dev') {
		process.nextTick(global.aro.testFns.runTests)
	} else if (mode === 'prod') {
		process.nextTick(() => global.aro.__app__())
	}
	const dir = file.startsWith('/') ? '' : process.cwd()
	return require(path.join(dir, file))
}