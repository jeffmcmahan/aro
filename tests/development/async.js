'use strict'

const nodeAssert = require('assert')
const {fn, param, precon, postcon, returns} = require('../../index')

// Call syncFunc before returning to interrupt the stack.
const asyncFunc = fn (() => {

	returns (Promise)

	syncFunc()
    return new Promise(r => setTimeout(r, 100))
})

// Plaino sync function to go between async calls in stack.
const syncFunc = fn (() => {

	returns (String)

	return 'foo'
})

// An async function that awaits async work and return sync.
// The idea is to mix async and sync in the stack and see that \
// everything still works okay.
const test = fn (async (fooArg) => {

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
	nodeAssert(v === 'foo')
})()