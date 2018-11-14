'use strict'

const {success, fail} = require('./utils')
const {fn, U, returns} = require('..')

// Cannot even declare a Union with <2 types:
fail(U, 'A Union type must combine 2 or more types.')
fail(() => U(String), 'A Union type must combine 2 or more types.')

// (1) Union with a String returned.
success(fn (() => {

	returns (U(String, Number))

	return ''
}))

// (2) Union with a Number returned.
success(fn(() => {

	returns (U(String, Number)) 

	return 0
}))

// (3) Union with Void returned.
fail(fn (() => {
	returns (U(String, Number))
}), 'Function of type U(String, Number) returned Void')

// (4) Union with Boolean returned.
fail(fn (() => {
	returns (U(String, Number)) 
	return false
}), 'Function of type U(String, Number) returned Boolean')
