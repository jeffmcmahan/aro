'use strict'

const assert = require('assert')
const {fn, runTests} = require('../../index')

// Make sure that fn() returns a function with a defineTest method.
assert(typeof fn(() => 0).test === 'function')

// Setup some invocation counters.
let syncTestRan = 0
let syncFuncRan = 0
let asyncFuncRan = 0
let asyncTestRan = 0

const func = fn (() => {

	// Define a tested function.

	syncFuncRan++
	return 1
})

const asyncFunc = fn (async () => {

	// Repeat the above for an async function.

	asyncFuncRan++
	return new Promise(res => setTimeout(() => res(5), 0))
})
