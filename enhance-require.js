'use strict'

const fs = require('fs')
const path = require('path')
const Module = require('module')
const transforms = require('./transforms')

const loadAsAro = (mode, content, module, filename) => {

	// Mutates the module object into its compiled state.

	content = transforms[mode](filename, content)
	module._compile(content, filename)
}

module.exports = mode => {

	// Redefine core Node.js function that require relies uses internally,
	// in order to prepare js code to run with Aro enhancements.

	Module.prototype.load = function (filename) {
		this.filename = filename
		this.paths = Module._nodeModulePaths(path.dirname(filename))
		let extension = path.extname(filename) || '.js'
		if (!Module._extensions[extension]) {
			extension = '.js'
		}
		if (extension === '.js') {
			const file = fs.readFileSync(filename, 'utf8').replace(/^#!.*\n/, '\n')
			if (file.trim().startsWith('\'use aro\'')) {
				loadAsAro(mode, file, this, filename)
			} else {
				Module._extensions[extension](this, filename)
			}
		} else {
			Module._extensions[extension](this, filename)
		}
		this.loaded = true
	}
}