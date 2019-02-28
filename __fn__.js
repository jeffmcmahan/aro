'use strict'

const {isAsync} = require('./utils')
const callStack = require('./call-stack')
const definedTests = require('./defined-tests')

const syncCall = (f, call, ...args) => {

	// Runs a synchronous function, then checks its return type 
	// and its postconditions.

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

	// Runs an asynchronous function, then checks its return/resolve
	// type and its postconditions.

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

const testFailMsg = (test, f) => (
	console.log(`\nTest failed: ${test.toString()}\n\nFor: fn (${f.toString()})\n`)
)

const createTest = (f, indirectFunc) => test => {

	// Stores a test function to be executed later via the runTests()
	// API function.

	definedTests.push(() => {
		if (isAsync(test)) {
			test(indirectFunc).then(r => {
				if (!r) {
					testFailMsg(test, f)
				}
			}).catch(e => {
				console.log(e)
				testFailMsg(test, f)
			})
		} else if (!test(indirectFunc)) {
			testFailMsg(test, f)
		}
	})
	return indirectFunc
}

module.exports = (function __fn__ (f) {

	// Note whether it uses the "async" keyword.
	const _isAsync = isAsync(f)

	// Record a mock function, to be used if present.
	let mock = null

	// Return the wrapper function that gets called.
	const indirectFunc = ((...args) => {
		const call = {
			args,
			fn: (mock || f),
			pre: 0,
			post: []
		}
		callStack.push(call) // Add the invocation to the call stack.

		// Execute the function and save the result.
		const result = _isAsync 
			? asyncCall((mock || f), call, ...args) 
			: syncCall((mock || f), call, ...args)
		
		callStack.pop() // Remove from the call stack.
		return result
	}).bind(void 0)

	// Define the mock-creation API.
	indirectFunc.mock = (mockFunc => {
		mock = (...args) => {
			mock = null
			return mockFunc(...args)
		}
	})

	// Define the test definition API.
	indirectFunc.test = createTest(f, indirectFunc)

	return indirectFunc
})
