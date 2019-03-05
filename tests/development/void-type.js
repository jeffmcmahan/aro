'use strict'

const assert = require('assert')
const {fn, returns, Void} = require('../../index')

const test1 = fn (() => {

	// Let implicit return produce undefined.

	returns (Void)

	// No return statement here.
})

assert.doesNotThrow(test1)

const test2 = fn (() => {

	// Void with a return value should fail.

	returns (Void)

	return ''
})

assert.throws(test2, /Function of type Void returned a String/)
