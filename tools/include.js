'use strict'

const fs = require('fs')

module.exports = name => {
	const fname = `${__dirname}/parts/${name}.js`
	const file = fs.readFileSync(fname, 'utf8').trim()
	return file + ';\n\n'
}