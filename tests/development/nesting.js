'use strict'

const nodeAssert = require('assert')
const {fn, returns} = require('../../index')

// Plaino fn() function here.
const inside = fn (() => {

	returns (Number)
	
	return 5
})

// A 3-deep nested fn(), calling another, 2-deep.
const outside = fn (fn ( fn (() => {

	returns (Function)

	return fn( inside )
})))

nodeAssert(outside()() === 5)
