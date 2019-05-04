'use strict'

module.exports = () => {

	// Define all globals, run tests, and then run app.

	const toolsPath = require('../tools')('run', 'dev')
	require(toolsPath)
	require('../enhance-require')('dev')
	process.nextTick(global.aro.testFns.runTests)
}