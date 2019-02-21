'use strict'

const {isAsync} = require('./utils')
const callStack = require('./call-stack')

const syncCall = (f, call, ...args) => {
	let returned = f(...args)
	if (call.type) {
		(call.type(returned))
	}
	if (call.post.length) {
		call.post.forEach(cond => cond(returned))
	}
	return returned
}

const asyncCall = (f, call, ...args) => {
	return new Promise((resolve, reject) => {
		f(...args).then(resolved => {
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

	// Return the wrapper function that gets called.
	const indirectFunc = (...args) => {
		const call = {
			args,
			fn: f,
			pre: 0,
			post: []
		}
		callStack.push(call) // Add the invocation to the call stack.

		// Execute the function and save the result.
		const result = _isAsync 
			? asyncCall(f, call, ...args) 
			: syncCall(f, call, ...args)
		
		callStack.pop() // Remove from the call stack.
		return result
	}

	// Create the test definition interface.
	indirectFunc.test = (test => {
		if (!test(indirectFunc)) {
			throw new Error('Test failed: ' + test.toString() + '\n\nFor: fn (' + f.toString() + ')\n')
		}
		return indirectFunc
	})

	// Todo: Create the mock definition interface.

	return indirectFunc
})
