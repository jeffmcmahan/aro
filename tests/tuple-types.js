'use strict'

const {success, fail} = require('./utils')
const {fn, Tuple, returns} = require('..')

// (1) Tuple with a String array returned.
success(fn (() => {

	returns (Tuple(String))

	return ['']
}))

// (2) Tuple with a Number and String array returned.
success(fn (() => {

	returns (Tuple(String, Number))

	return ['', 0]
}))

// (3) Tuple reversed
fail(
	fn (() => {
		returns (Tuple(String, Number))
		return [0, '']
	}),
	'Function of type Tuple(String, Number) returned a [Number, String].'
)

// (4) Tuple with a plain Boolean returned.
fail(
	fn (() => {
		returns (Tuple(String, Number)) 
		return false
	}), 
	'Function of type Tuple(String, Number) returned a Boolean.'
)
