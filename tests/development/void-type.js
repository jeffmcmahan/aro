'use strict'

const {success, fail} = require('./utils')
const {fn, desc, Void, returns} = require('../../index')

const test1 = fn (() => {

	desc	('Let implicit return produce undefined.')
	returns (Void)

	// No return statement here.
})

success(test1)

const test2 = fn (() => {

	desc	('Void with a return value should fail.')
	returns (Void)

	return ''
})

fail(test2, 'Function of type Void returned a String')
