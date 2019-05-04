'use strict'

module.exports = () => {

	// Setup to run in production (in Nodejs only).

	const toolsPath = require('../tools')('run', 'prod')
	require(toolsPath)
	require('../enhance-require')('prod')
	process.nextTick(() => global.aro.__app__())
}