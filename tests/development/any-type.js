'use strict'

const {success} = require('./utils')
const {fn, param, Any, returns} = require('../../index')

// This should always work. There are no checks.
const test1 = fn (foo => {

	param   (foo)(Any)
	returns (Any)
	
	return new Date()
})

success(test1)
success(() => test1(0))
success(() => test1(true))
success(() => test1({}))
