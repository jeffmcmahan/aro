'use strict'

const fs = require('fs')
const state = require('./state')

if (state.mode === 'on') {
	((require || {}).extensions || {})['.js'] = (module, fname) => {
		let content = fs.readFileSync(fname, 'utf8')
		const isProjectFile = !fname.includes('/node_modules/')
		if (isProjectFile) {
			try {
				const tests = fs.readFileSync(fname.slice(0,-3) + '.test.js', 'utf8')
				content += tests ? `;(() => {${tests}})();` : ''
			} catch (e) {
				// No tests defined.
			}
		}
		module._compile(content, fname)
	}
}
