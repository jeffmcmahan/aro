'use strict'

const typeCheck = require('protocheck')
const state = require('./state')
const error = require('./utils/error')
const noop = (() => void 0)
const api = {}

// Development/Debug Mode
if (state.mode === 'on') {

	api.fn = require('./__fn__')

	api.param = val => __Type => {
		if (typeCheck(val, __Type)) {
			return noop
		}
		const {valueTypeName, expectedTypeName} = typeCheck.failureDetail(val, __Type)
		throw new TypeError(
			error.paramType(expectedTypeName, valueTypeName, new Error())
		)
	}

	api.precon = f => {
		const call = state.callStack.slice(-1)[0]
		call.pre++
		try {
			if (!f()) {
				throw new Error(error.precondition(call.pre, new Error()))
			}
		} catch (e) {
			throw new Error(error.precondition(call.pre, e))
		}
	}

	api.postcon = f => {
		const call = state.callStack.slice(-1)[0]
		const conditionCheck = returnVal => {
			if (!f(returnVal)) {
				throw new Error(
					`Post-condition ${f.toString()} failed in: fn (${call.fn.toString()})`
				)
			}
		}
		state.callStack.slice(-1)[0].post.push(conditionCheck)
	}

	api.returns = __Type => {
		state.callStack.slice(-1)[0].type = val => {
			if (!typeCheck(val, __Type)) {
				const {valueTypeName, expectedTypeName} = typeCheck.failureDetail(val, __Type)
				throw new TypeError(
					error.returnType(expectedTypeName, valueTypeName, new Error())
				)
			}
		}
		return noop
	}

	api.runTests = async () => {
		await new Promise(r => setTimeout(r, 1))
		const allTests = state.tests.entries()
		for (const [i, test] of allTests) {
			state.mocks.clear()
			await new Promise(r => setTimeout(r, 25))
			if (!await test()) {
				return state.mocks.clear()
			}
		}
		state.mocks.clear()
	}

	api.types = typeCheck.types
	Object.keys(api.types).forEach(key => api[key] = api.types[key])
}

// Production Mode
if (state.mode === 'off') {
	api.fn = f => {
		f.test = (() => f)
		f.mock = (() => f)
		return f
	}
	api.runTests = () => Promise.resolve()
	api.precon 	= noop
	api.postcon = noop
	api.param 	= (() => noop)
	api.returns = noop
	api.types	= {}
	Object.keys(typeCheck.types).forEach(key => (
		api[key] = api.types[key] = noop
	))
}

// If running node, enable tests and expose the build tool.
if (state.engine() === 'node') {
	require('./enable-tests')
}

Object.freeze(api.types)
module.exports = Object.freeze(api)
