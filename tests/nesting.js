'use strict'

const nodeAssert = require('assert')
const {fn, desc, returns} = require('..')

const inside = fn (() => {

	desc	('Plaino fn() function here.')
	returns (Number)
	
	return 5
})

const outside = fn (fn ( fn (() => {

	desc	('A 3-deep nested fn(), calling another, 2-deep.')
	returns (Function)

	return fn( inside )
})))

nodeAssert(outside()() === 5)
