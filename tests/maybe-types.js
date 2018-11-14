'use strict'

const {success, fail} = require('./utils')
const {fn, Maybe, returns} = require('..')

// (1) Maybe with a String returned.
success(fn (() => {
	returns (Maybe(String))
}))

// (2) Maybe with Void returned.
success(fn (() => {
	returns (Maybe(String))
}))

// (3) Maybe with a Number returned.
fail(
	fn(() => {
		returns (Maybe(String))
		return 0
	}),
	'Function of type Maybe(String) returned Number'
)
