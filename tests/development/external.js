'use strict'

const assert = require('assert')
const {fn} = require('../../index')
let tested = false

const externallyTested = fn (() => {

	// Test to see whether external.test.js gets appended to this
	// file and executed.

	return 1
})

setTimeout(() => {
	assert(tested)
	assert(console.logged.some(m => (
		m.includes('\nTest failed: () => {\n\treturn false')
	)))
}, 300)
