'use strict'

const {isAsync} = require('./utils')
const {callStack, definedTests, mocks} = require('./state')

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

const testFailMsg = (test, f) => (
	`\nTest failed: ${test.toString()}\n\nFor: fn (${f.toString()})\n`
)

const createTest = (f, indirectFunc) => test => {

	// Stores a test function to be executed later via the runTests()
	// API function.

	const theTest = async () => {
		try {
			if (!(await test(indirectFunc))) {
				console.log(testFailMsg(test, f))
				return false
			}
		} catch (e) {
			console.log(e)
			console.log(testFailMsg(test, f))
			return false
		}
		return true // Test passed without error.
	}
	definedTests.push(theTest)
	return indirectFunc
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

	// Define the mock-creation API.
	indirectFunc.mock = (mockFn => mocks.set(f, (...args) => mockFn(...args)))

	// Define the test definition API.
	indirectFunc.test = createTest(f, indirectFunc)

	return indirectFunc
})
