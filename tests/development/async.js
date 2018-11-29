'use strict'

const nodeAssert = require('assert')
const {fn, desc, note, param, pre, post, returns} = require('../../index')

const asyncFunc = fn (() => {

	desc	('Call syncFunc before returning to interrupt the stack.')
	returns (Promise)

	syncFunc()
    return new Promise(r => setTimeout(r, 100))
})

const syncFunc = fn (() => {

	desc	('Plaino sync function to go between async calls in stack.')
	returns (String)

	return 'foo'
})

const test = fn (async (fooArg) => {

	desc    ('An async function that awaits async work and return sync.')
	note	('The idea is to mix async and sync in the stack and see that \
			  everything still works okay.')
	param   (fooArg)(String)
	returns (String)

	pre		(fooArg.includes('foo'))
	post  	(r => r === 'foo')

	syncFunc()
	await asyncFunc()	
	return syncFunc()
})

module.exports = (async () => {
	const v = await test('foo')
	nodeAssert(v === 'foo')
})()