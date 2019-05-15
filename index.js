#!/usr/bin/env node --experimental-modules 

import {join} from 'path'
import {readdir} from './utils/fs.js'
import build from './build.js'
import run from './run.js'
const log = console.log

// Gather and process the arguments.
const [cmd, mode, rootFile] = process.argv.slice(2)
process.env.NODE_ENV = mode
process.argv = [
	...process.argv.slice(0, 2), 
	...process.argv.slice(5)
]

// Ensure that command is valid.
if (!['run', 'build'].includes(cmd)) {
	process.stderr.write(`Invalid command "${cmd}": use "run" or "build".\n`)
	process.exit(1)
}

// Ensure that mode is valid.
if (!['production', 'development'].includes(mode)) {
	process.stderr.write(`Invalid mode "${mode}": use "production" or "development".\n`)
	process.exit(1)
}

// Ensure that the entry point file is provided.
if (!rootFile) {
	process.stderr.write('Target project root directory must be provided.')
	process.exit(1)
}

// Build, and if apporpriate, run.
;(async () => {
	const rootDir = join(process.cwd(), rootFile)
	const contents = await readdir(rootDir).catch(log)
	if (!contents.includes('src')) {
		throw new Error('Project root dir must include a "src" directory.')
	}
	await build(mode, rootDir).catch(log)
	if (cmd === 'run') {
		run(mode, rootDir).catch(log)
	} else {
		// Need to run tests and call main somewhere...
		process.exit(0)
	}
})()