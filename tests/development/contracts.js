'use strict'

const assert = require('assert')
const {fn, precon, postcon} = require('../../index')

const preTest = fn (arg => {
	precon (() => !isNaN(arg))
	precon (() => arg === 5)
})

assert.throws(
	() => preTest(6),
	e => e.message.includes('Precondition no. 2 failed')
)
assert.throws(
	() => preTest(NaN),
	e => e.message.includes('Precondition no. 1 failed')
)
assert.doesNotThrow(() => preTest(5))

/////////////////////////////////////////////////////////////////

const postTest = fn (arg => {
	postcon	(r => !isNaN(r))
	postcon	(r => r === 5)
	return arg
})

assert.throws(
	() => postTest(6),
	e => e.message.includes('Post-condition r => r === 5 failed')
)
assert.throws(
	() => postTest(NaN),
	e => e.message.includes('Post-condition r => !isNaN(r) failed')
)
assert.doesNotThrow(() => postTest(5))

console.log('Code contract tests passed.')
