'use strict'

const {isAsync} = require('./utils')
const callStack = require('./call-stack')
const assert = condition => {
	if (!condition) {
		throw new Error('Test failed.')
	}
}

module.exports = fn => {

	fn.async = isAsync(fn) 	// Explicitly declared using the "async" keyword.

	// When the function is called.
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
			returned = fn(...args)
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
}
