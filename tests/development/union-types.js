'use strict'

const assert = require('assert')
const {fn, returns, U} = require('../../index')

const test1 = fn (() => {

	// Union with a String returned.

	returns (U(String, Number))

	return ''
})

assert.doesNotThrow(test1)

const test2 = fn(() => {

	// Union with a Number returned.

	returns (U(String, Number)) 

	return 0
})

assert.doesNotThrow(test2)

const test3 = fn (() => {

	// Union with Void returned.

	returns (U(String, Number))
	
	// No return statement here.
})

assert.throws(test3, /Function of type U\(String, Number\) returned undefined/)

const test4 = fn (() => {

	// Union with Boolean returned.

	returns (U(String, Number))

	return false
})

assert.throws(test4, /Function of type U\(String, Number\) returned a Boolean/)
