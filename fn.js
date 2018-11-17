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

module.exports = (fn => {

	// Note whether it uses the "async" keyword.
	fn.async = isAsync(fn) 	

	// Return a new function.
	return (...args) => {
		callStack.push({fn, args})
		let returned
		if (fn.async) {
			returned = fn(...args) // Promise
			returned.then(resolved => {
				if (fn.type) {
					(fn.type(resolved))
				}
				if (fn.onReturn) {
					assert(fn.onReturn(resolved))
				}
			})
			if (fn.onError) {
				returned.catch(err => fn.onError(err))
			}
		} else {
			if (fn.onError) {
				try {
					returned = fn(...args)
				} catch (err) {
					fn.onError(err)
				}
			} else {
				returned = fn(...args)
			}
			if (fn.type) {
				(fn.type(returned))
			}
			if (fn.onReturn) {
				assert(fn.onReturn(returned))
			}
		}
		callStack.pop()
		return returned
	}
})
