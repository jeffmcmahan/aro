'use strict'

const {success, fail} = require('./utils')
const {fn, Maybe} = require('..')

// (1) Maybe with a String returned.
success(fn (Maybe(String)) (() => ''))

// (2) Maybe with Void returned.
success(fn (Maybe(String)) (() => {}))

// (3) Maybe with a Number returned.
fail(
	fn (Maybe(String)) (() => 0), 
	'Function of type Maybe(String) returned a Number.'
)
