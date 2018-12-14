'use strict'

const {success, fail} = require('./utils')
const {fn, U, returns} = require('../../index')

// Union with a String returned.
const test1 = fn (() => {

	returns (U(String, Number))

	return ''
})

success(test1)

// Union with a Number returned.
const test2 = fn(() => {

	returns (U(String, Number)) 

	return 0
})

success(test2)

// Union with Void returned.
const test3 = fn (() => {

	returns (U(String, Number))
	
	// No return statement here.
})

fail(test3, 'Function of type U(String, Number) returned undefined')

// Union with Boolean returned.
const test4 = fn (() => {

	returns (U(String, Number))

	return false
})

fail(test4, 'Function of type U(String, Number) returned a Boolean')
