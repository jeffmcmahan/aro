'use strict'

const nodeAssert = require('assert')
const {fn, desc, note, param, assert, returns} = require('..')

const asyncFunc = fn (() => {

	desc	('Call syncFunc before returning to interrupt the stack.')
	returns (Promise)

	syncFunc()
    return new Promise(r => setTimeout(r, 400))
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
	assert  (r => r === 'foo')
	returns (String)

	syncFunc()
	await asyncFunc()	
	return syncFunc()
})

;(async () => {
	const v = await test('')
	nodeAssert(v === 'foo')
})()