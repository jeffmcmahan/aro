'use strict'

const {success} = require('./utils')
const {fn, desc, param, Any, returns} = require('..')

const test1 = fn (foo => {

	desc    ('This should always work. There are no checks.')
	param   (foo)(Any)
	returns (Any)('Does not matter')
	
	return new Date()
})

success(test1)
success(() => test1(0))
success(() => test1(true))
success(() => test1({}))
