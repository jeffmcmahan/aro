'use strict'

const assert = require('assert')
const {fn, returns, Maybe} = require('../../index')

const test1 = fn (() => {

	// Maybe with a String returned.

	returns (Maybe(String))

	return 'foo'
})

assert.doesNotThrow(test1)

const test2 = fn (() => {

	// Maybe with Void returned.

	returns (Maybe(String))

	// No return statement here.
})

assert.doesNotThrow(test2)

const test3 = fn(() => {

	// Maybe with a Number returned.

	returns (Maybe(String))

	return 0
})

assert.throws(test3, /Function of type Maybe\(String\) returned a Number/)
