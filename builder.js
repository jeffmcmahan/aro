'use strict'
 
const state = require('./state')
const path = require('path')
const fs = require('fs')
const sh = require('child_process').execSync

const read = (dir) => {

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

const appendTests = dir => {

	// Read the .js files and if there is a corresponding .test.js file,
	// read it, and append it to the JS file.

	const files = read(dir)
	files.forEach(fpath => {
		const isTestFile = fpath.slice(-8) === '.test.js'
		const srcFile = fpath.slice(0, -8) + '.js'
		const hasSrcFile = files.includes(srcFile)
		if (isTestFile && hasSrcFile) {
			fs.appendFileSync(srcFile, fs.readFileSync(fpath, 'utf8'))
		}
	})
}

module.exports = (projectRoot) => {

	// Synchronously creates a browser build of the project in the given dir.

	if (typeof projectRoot !== 'string') {
		throw new TypeError('Project root must be a string')
	}

	const srcMain = require.resolve(projectRoot)
	const rootDir = path.dirname(srcMain)
	const buildDir = (rootDir + '-build')
	const compiled = path.join(
		path.dirname(rootDir), 
		path.basename(rootDir) + '-compiled.js'
	)

	// Create the temporary build directory.
	sh(`rm -rf ${buildDir} && mkdir ${buildDir}`)

	// Copy the source code into the build directory
	// Todo: Avoid copying node_modules. 
	sh(`cp -r ${rootDir}/* ${buildDir}`)

	// Add the test files to the build.
	if (state.mode === 'on') {
		appendTests(buildDir)
	}

	sh(`browserify ${buildDir} > ${compiled}`)
	sh(`rm -rf ${buildDir}`)

	// Flip the development switch if appropriate.
	if (state.mode === 'on') {
		const compiledFile = fs.readFileSync(compiled, 'utf8')
		fs.writeFileSync(compiled, `window['--development'] = true;\n${compiledFile}`)
	}
}
