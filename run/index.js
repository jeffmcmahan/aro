'use strict'

const path = require('path')
const dev = require('./dev')
const prod = require('./prod')

module.exports = (mode, file) => {

	// Setup globals that are always available.
	
	if (mode === 'dev') {
		dev()
	} else if (mode === 'prod') {
		prod()
	} else {
		process.stderr.write(`Invalid mode "${mode}": use "dev" or "prod".\n`)
		process.exit(1)
	}

	const dir = file.startsWith('/') ? '' : process.cwd()
	return require(path.join(dir, file))
}