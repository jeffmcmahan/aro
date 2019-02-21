'use strict'

const typeCheck = require('protocheck')
const callStack = require('./call-stack')
const error = require('./utils/error')
const mode = require('./utils/mode')()
const noop = () => {}
const curryNoop = () => noop
const api = {}

// Development/Debug Mode
if (mode === 'on') {
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
	api.precon = condition => {
		const call = callStack.slice(-1)[0]
		call.pre++
		if (!condition) {
			throw new Error(
				`Precondition #${call.pre} failed in: fn (${call.fn.toString()})`
			)
		}
	}
	api.postcon = f => {
		const call = callStack.slice(-1)[0]
		const conditionCheck = returnVal => {
			if (!f(returnVal)) {
				throw new Error(
					`Post-condition ${f.toString()} failed in: fn (${call.fn.toString()})`
				)
			}
		}
		callStack.slice(-1)[0].post.push(conditionCheck)
	}
	api.returns = __Type => {
		callStack.slice(-1)[0].type = val => {
			if (!typeCheck(val, __Type)) {
				const {valueTypeName, expectedTypeName} = typeCheck.failureDetail(val, __Type)
				throw new TypeError(
					error.returnType(expectedTypeName, valueTypeName, new Error())
				)
			}
		}
		return noop
	}
	api.types = typeCheck.types
	Object.keys(api.types).forEach(key => api[key] = api.types[key])
}

// Production Mode
if (mode === 'off') {
	api.fn 		= f => f
	api.precon 	= noop
	api.postcon = noop
	api.param 	= curryNoop
	api.returns = noop
	api.types	= {}
	Object.keys(typeCheck.types).forEach(key => api[key] = api.types[key] = noop)
}

Object.freeze(api.types)
module.exports = Object.freeze(api)
