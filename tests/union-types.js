'use strict'

const {success, fail} = require('./utils')
const {fn, desc, U, returns} = require('..')

// Cannot even declare a Union with <2 types:
fail(U, 'A Union type must combine 2 or more types.')
fail(() => U(String), 'A Union type must combine 2 or more types.')

const test1 = fn (() => {

	desc	('Union with a String returned.')
	returns (U(String, Number))

	return ''
})

success(test1)

const test2 = fn(() => {

	desc	('Union with a Number returned.')
	returns (U(String, Number)) 

	return 0
})

success(test2)

const test3 = fn (() => {

	desc	('Union with Void returned.')
	returns (U(String, Number))
	
	// No return statement here.
})

fail(test3, 'Function of type U(String, Number) returned Void')

const test4 = fn (() => {

	desc	('Union with Boolean returned.')
	returns (U(String, Number))

	return false
})

fail(test4, 'Function of type U(String, Number) returned a Boolean')
