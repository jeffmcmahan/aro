'use strict'

const {success, fail} = require('./utils')
const {fn, Tuple} = require('..')

// (1) Tuple with a String array returned.
success(fn (Tuple(String)) (() => ['']))

// (2) Tuple with a Number and String array returned.
success(fn (Tuple(String, Number)) (() => ['', 0]))

// (3) Tuple reversed
fail(
	fn (Tuple(String, Number)) (() => [0, '']), 
	'Function of type Tuple(String, Number) returned a [Number, String].'
)

// (4) Tuple with a plain Boolean returned.
fail(
	fn (Tuple(String, Number)) (() => false), 
	'Function of type Tuple(String, Number) returned a Boolean.'
)
