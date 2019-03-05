'use strict'

const assert = require('assert')
const {fn, param, returns, Any} = require('../../index')

const test1 = fn (foo => {

	// This should always work. There are no checks.

	param   (foo)(Any)
	returns (Any)
	
	return new Date()
})

assert.doesNotThrow(test1)
assert.doesNotThrow(() => test1(0))
assert.doesNotThrow(() => test1(true))
assert.doesNotThrow(() => test1({}))
