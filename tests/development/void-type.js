'use strict'

const {success, fail} = require('./utils')
const {fn, Void, returns} = require('../../index')

// Let implicit return produce undefined.
const test1 = fn (() => {

	returns (Void)

	// No return statement here.
})

success(test1)

// Void with a return value should fail.
const test2 = fn (() => {

	returns (Void)

	return ''
})

fail(test2, 'Function of type Void returned a String')
