'use strict'

const {isAsync} = require('./utils')
const callStack = require('./call-stack')
const assert = require('./utils/assert')

const syncCall = (f, call, ...args) => {
	let returned = f(...args)
	if (call.type) {
		(call.type(returned))
	}
	if (call.post) {
		assert(f.post(returned))
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
			if (call.post) {
				assert(call.post(resolved))
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
	f.async = isAsync(f)

	// Return the wrapper function that gets called.
	return (...args) => {
		const call = {fn: f, args}
		callStack.push(call) // Add the invocation to the call stack.

		// Execute the function and save the result.
		const result = f.async 
			? asyncCall(f, call, ...args) 
			: syncCall(f, call, ...args)
		
		callStack.pop() // Remove from the call stack.
		return result
	}
})
