'use strict'

const assert = require('assert')
const {fn, param, returns} = require('../../index')
const dict = Object.create(null)

const test1 = fn (() => {

	// Return type.

	returns	(String)

	return ''
})

assert.doesNotThrow(test1)

const test2 = fn (foo => {

	// Parameter type.

	param 	(foo)(String)

	return ''
})

assert.doesNotThrow(() => test2(''))
assert.throws(test2, /A String parameter was of type undefined/)
assert.throws(() => test2(null), 	/A String parameter was of type null/)
assert.throws(() => test2(2), 		/A String parameter was of type Number/)
assert.throws(() => test2(false),	/A String parameter was of type Boolean/)
assert.throws(() => test2({}), 		/A String parameter was of type Object/)
assert.throws(() => test2(dict), 	/A String parameter was of type Dictionary/)
