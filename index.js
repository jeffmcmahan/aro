#!/usr/bin/env node
'use strict'

const run = require('./run')
const build = require('./build')

// Gather and process the arguments.
const [cmd, mode, rootFile, outputDir] = process.argv.slice(2)
process.argv = [...process.argv.slice(0,2), ...process.argv.slice(5)]
process.env.ARO_ENV = mode

if (cmd === 'run') {
	module.exports = run(mode, rootFile)
} else if (cmd === 'build') {
	build(mode, rootFile, outputDir)
} else {
	process.stderr.write(`Invalid aro command "${cmd}": use "run" or "build".\n`)
	process.exit(1)
}
