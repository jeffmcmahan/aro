#!/usr/bin/env node --experimental-modules 

import {join} from 'path'
import {readdir} from './utils/fs.js'
import build from './build.js'
const log = console.log

const [rootFile] = process.argv.slice(2)
process.argv.splice(2, 1)

// Ensure that the entry point file is provided.
if (!rootFile) {
	process.stderr.write('Target project root directory must be provided.')
	process.exit(1)
}

void (async () => {

	// Build the production and development code.

	const rootDir = join(process.cwd(), rootFile)
	const contents = await readdir(rootDir).catch(log)
	if (!contents.includes('src')) {
		throw new Error('Project root dir must include a "src" directory.')
	}
	await build('development', rootDir).catch(log)
	await build('production', rootDir).catch(log)
})()