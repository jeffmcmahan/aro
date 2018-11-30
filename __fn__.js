'use strict'

const {isAsync} = require('./utils')
const callStack = require('./call-stack')
const assert = require('./utils/assert')

const syncCall = (f, ...args) => {
	let returned = f(...args)
	if (f.type) {
		(f.type(returned))
	}
	if (f.post) {
		assert(f.post(returned))
	}
	return returned
}

const asyncCall = (f, call, ...args) => {
	return new Promise((resolve, reject) => {
		f(...args).then(resolved => {
			callStack.push(call)
			if (f.type) {
				(f.type(resolved))
			}
			if (f.post) {
				assert(f.post(resolved))
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
		callStack.push(call) // Add the internal function to the call stack.
		const result = f.async ? asyncCall(f, call, ...args) : syncCall(f, ...args)
		callStack.pop() // Remove from the call stack.
		return result
	}
})
