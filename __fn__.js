'use strict'

const {isAsync} = require('./utils')
const callStack = require('./call-stack')

// Just throw if the condition is false.
const assert = (condition => {
	if (!condition) {
		throw new Error('Test failed.')
		// Todo: Serialize the function to create a nice message.
	}
})

module.exports = (function __fn__ (f) {

	// Note whether it uses the "async" keyword.
	f.async = isAsync(f) 	

	// Return a new function.
	return (...args) => {
		const fcall = {fn:f, args}
		callStack.push(fcall)
		let returned
		if (f.async) {
			returned = f(...args) // Promise
			returned.then(resolved => {
				callStack.push(fcall) // Async-ify the callStack
				if (f.type) {
					(f.type(resolved))
				}
				if (f.onReturn) {
					assert(f.onReturn(resolved))
				}
				callStack.pop()
			})
			if (f.onError) {
				returned.catch(err => {
					callStack.push(fcall) // Async-ify the callStack
					f.onError(err)
					callStack.pop()
				})
			}
		} else {
			if (f.onError) {
				try {
					returned = f(...args)
				} catch (err) {
					f.onError(err)
				}
			} else {
				returned = f(...args)
			}
			if (f.type) {
				(f.type(returned))
			}
			if (f.onReturn) {
				assert(f.onReturn(returned))
			}
		}
		callStack.pop()
		return returned
	}
})
