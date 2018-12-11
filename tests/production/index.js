'use strict'

const {fn, desc, note, param, returns, pre, post, Maybe} = require('../../index')
const assert = require('assert')

const functionShouldRun = fn (() => 5)

const aroFunctinosAreDead = fn (fooParam => {

	desc	('None of these aro API functions should do anything.')
	note	('These should be noops that the compiler yanks from the callstack.')
	param	(fooParam)(String)
	returns	(Maybe(String))
	pre		(fooParam === Infinity)
	post	(r => r === 6)

	return 5
})

assert.equal(functionShouldRun(), 5)
assert.doesNotThrow(aroFunctinosAreDead)

console.log('Production mode tests completed.')
