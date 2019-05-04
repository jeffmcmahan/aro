'use strict'

const path = require('path')
const fs = require('fs')
const sh = require('child_process').execSync
const transforms = require('../transforms')
const tools = require('../tools')

const read = dir => {

	// Recursively reads the given directory and returns an array
	// of absolute file paths (no directory paths).

	const files = fs.readdirSync(dir).filter(f => f[0] !== '.').map(f => path.join(dir, f))
	files.forEach(fpath => {
		const item = fs.statSync(fpath)
		if (item.isDirectory()) {
			files.push(...read(fpath))
		}
	})
	return files
}

module.exports = (mode, projectDir, outputDir) => {

	// Synchronously creates a dev or prod build of the project.

	if (typeof projectDir !== 'string') {
		throw new Error('Project directory must be specified.')
	}
	if (typeof outputDir !== 'string') {
		throw new Error('Output directory must be specified.')
	}

	// Resolve the paths.
	projectDir = path.join(process.cwd(), projectDir)
	outputDir = path.join(process.cwd(), outputDir)

	// Prevent accidental destruction of source code.
	if (projectDir === outputDir) {
		throw new Error('Project dir and output dir can\'t be the same.')
	}

	// Copy the source code into the build directory
	// Todo: Skip ./node_modules.
	sh(`cp -R ${projectDir}/. ${outputDir}`)

	read(projectDir).forEach(fname => {
		let file = fs.readFileSync(fname, 'utf8')
		file = transforms[mode](fname, file)
		fs.writeFileSync(fname.replace(projectDir, outputDir), file)
	})

	fs.writeFileSync(`${outputDir}/aro-tools.js`, tools('build', mode))
}
