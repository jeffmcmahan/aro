'use strict'

const assert = require('assert')
const {fn, returns} = require('../../index')

const inside = fn (() => {

	// Plaino fn() function here.

	returns (Number)
	
	return 5
})

const outside = fn (fn ( fn (() => {

	// A 3-deep nested fn(), calling another, 2-deep.

	returns (Function)

	return fn( inside )
})))

assert(outside()() === 5)
