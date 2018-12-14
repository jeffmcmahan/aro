'use strict'

const assert = require('assert')
const {fn, precon, postcon} = require('../../index')

const preTest = fn (arg => {

	precon (!isNaN(arg))
	precon (arg === 5)
})

assert.throws(() => preTest(6))
assert.throws(() => preTest(NaN))
assert.doesNotThrow(() => preTest(5))

const postTest = fn (arg => {

	postcon	(r => !isNaN(r))
	postcon	(r => r === 5)

	return arg
})

assert.throws(() => postTest(6))
assert.throws(() => postTest(NaN))
assert.doesNotThrow(() => postTest(5))

console.log('Code contract tests passed.')
