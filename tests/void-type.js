'use strict'

const {success, fail} = require('./utils')
const {fn, Void, returns} = require('..')

success(fn (() => {
	returns (Void)
}))

// Void with a return value should fail.
fail(fn (() => {

	returns (Void)

	return ''
}), 'Function of type Void returned a String.')
