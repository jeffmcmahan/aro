'use strict'

const assert = require('assert')
const {fn, param, returns, precon, postcon} = require('../../index')

const asyncFunc = fn (() => {

	// Call syncFunc before returning to interrupt the stack.

	returns (Promise)

	syncFunc()
    return new Promise(r => setTimeout(r, 100))
})

const syncFunc = fn (() => {

	// Plaino sync function to go between async calls in stack.

	returns (String)

	return 'foo'
})

const test = fn (async (fooArg) => {

	// An async function that awaits async work and return sync.
	// The idea is to mix async and sync in the stack and see that \
	// everything still works okay.

	param   (fooArg)(String)
	returns (String)

	precon	(() => fooArg.includes('foo'))
	postcon	(r => r === 'foo')

	syncFunc()
	await asyncFunc()	
	return syncFunc()
})

module.exports = (async () => {
	const v = await test('foo')
	assert(v === 'foo')
})()