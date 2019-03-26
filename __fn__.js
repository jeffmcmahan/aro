'use strict'

const {callStack, tests, mocks} = require('./state')
const isAsync = require('./utils/is-async')

const syncCall = (call, ...args) => {

	// Runs a synchronous function, then checks its return type 
	// and its postconditions.

	const returned = call.fn(...args)
	if (call.type) {
		(call.type(returned))
	}
	if (call.post.length) {
		call.post.forEach(cond => cond(returned))
	}
	return returned
}

const asyncCall = (call, ...args) => {

	// Runs an asynchronous function, then checks its return/resolve
	// type and its postconditions.

	return new Promise((resolve, reject) => {
		call.fn(...args).then(resolved => {
			callStack.push(call)
			if (call.type) {
				(call.type(resolved))
			}
			if (call.post.length) {
				call.post.forEach(postCond => postCond(resolved))
			}
			resolve(resolved)
			callStack.pop()
		}).catch(err => {
			callStack.push(call)
			reject(err)
			callStack.pop()
		})
	})
}

module.exports = (function __fn__ (f) {

	// Note whether it uses the "async" keyword.
	const _isAsync = isAsync(f)

	// Record a mock function, to be used if present.
	mocks.set(f, null)

	// Return the wrapper function that gets called.
	const indirectFunc = ((...args) => {
		const call = {
			args,
			fn: (mocks.get(f) || f),
			pre: 0,
			post: []
		}
		callStack.push(call) // Add the invocation to the call stack.

		// Execute the function and save the result.
		const result = _isAsync
			? asyncCall(call, ...args) 
			: syncCall(call, ...args)
		
		callStack.pop() // Remove from the call stack.
		return result
	}).bind(void 0)

	// Define the testing API.
	indirectFunc.mock = mock => mocks.set(f, mock)
	indirectFunc.test = test => tests.push(test)

	return indirectFunc
})
