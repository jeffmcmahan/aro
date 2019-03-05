'use strict'

const assert = require('assert')
const {fn, param, returns, precon, postcon, Maybe} = require('../../index')
const testRan = false
const functionShouldRun = fn (() => 5)

const aroIsPassive = fn (fooParam => {

	// None of the aro API functions should do anything.
	// These should be noops that the compiler yanks from the callstack.

	param	(fooParam)(String)
	returns	(Maybe(String))
	precon	(fooParam === Infinity)
	postcon	(r => r === 6)

	return 5
})

.test(() => testRan = true)

assert.equal(functionShouldRun(), 5)
assert.doesNotThrow(aroIsPassive)
assert(testRan === false)
