'use strict'

const {success, fail} = require('./utils')
const {fn, desc, Maybe, returns} = require('..')

const test1 = fn (() => {

	desc	('Maybe with a String returned.')
	returns (Maybe(String))

	return 'foo'
})

success(test1)

const test2 = fn (() => {

	desc	('Maybe with Void returned.')
	returns (Maybe(String))

	// No return statement here.
})

success(test2)

const test3 = fn(() => {

	desc	('Maybe with a Number returned.')
	returns (Maybe(String))

	return 0
})

fail(test3, 'Function of type Maybe(String) returned a Number')
