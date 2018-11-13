'use strict'

const assert = require('assert')
const {isAsync} = require('./utils')
const typeCheck = require('./type-check')
const callStack = require('./call-stack')

module.exports = Type => fn => {

	fn.async = isAsync(fn) 	// Explicitly declared using the "async" keyword.
	fn.type = typeCheck('function')(Type)

	// When the function is called.
	return (...args) => {
		callStack.push({fn, args})
		let returned
		if (fn.async) {
			returned = fn(...args) // Promise
			returned.then(resolved => {
				fn.type(resolved)
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
			fn.type(returned)
			if (fn.onReturn) {
				assert(fn.onReturn(returned))
			}
		}
		callStack.pop()
		return returned
	}
}
