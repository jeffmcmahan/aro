'use strict'

const typeCheck = require('protocheck')
const callStack = require('./call-stack')
const error = require('./utils/error')
const assert = require('./utils/assert')
const mode = require('./utils/mode')()
const noop = () => noop
const api = {}

// Development/Debug Mode
if (mode === 'on') {
	api.fn 		= require('./__fn__')
	api.desc 	= noop
	api.note 	= noop
	api.pre 	= assert
	api.post 	= f => callStack.slice(-1)[0].fn.post = f
	api.error 	= f => callStack.slice(-1)[0].fn.onError = f

	api.param = val => __Type => {
		if (typeCheck(val, __Type)) {
			return noop
		}
		const {valueTypeName, expectedTypeName} = typeCheck.failureDetail(val, __Type)
		throw new TypeError(
			error.paramType(expectedTypeName, valueTypeName, new Error())
		)
	}
	
	api.returns = Type => {
		callStack.slice(-1)[0].fn.type = val => {
			if (!typeCheck(val, Type)) {
				const {valueTypeName, expectedTypeName} = typeCheck.failureDetail(val, Type)
				throw new TypeError(
					error.returnType(expectedTypeName, valueTypeName, new Error())
				)
			}
		}
		return noop
	}
	api.types 	= typeCheck.types
	Object.keys(api.types).forEach(key => api[key] = api.types[key])
}

// Production Mode
if (mode === 'off') {
	api.fn 		= f => f
	api.desc 	= noop
	api.note 	= noop
	api.pre 	= noop
	api.post 	= noop
	api.error 	= noop
	api.param 	= noop
	api.returns = noop
	api.types 	= typeCheck.types
	Object.keys(api.types).forEach(key => api[key] = api.types[key] = noop)	
}

module.exports = api
