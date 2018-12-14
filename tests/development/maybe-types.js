'use strict'

const {success, fail} = require('./utils')
const {fn, Maybe, returns} = require('../../index')

// Maybe with a String returned.
const test1 = fn (() => {

	returns (Maybe(String))

	return 'foo'
})

success(test1)

// Maybe with Void returned.
const test2 = fn (() => {

	returns (Maybe(String))

	// No return statement here.
})

success(test2)

// Maybe with a Number returned.
const test3 = fn(() => {

	returns (Maybe(String))

	return 0
})

fail(test3, 'Function of type Maybe(String) returned a Number')
