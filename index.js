'use strict'

const typeCheck = require('protocheck')
const callStack = require('./call-stack')
const error = require('./utils/error')
const noop = () => void 0

// API surface
exports.types 	= typeCheck.types
exports.fn 		= require('./__fn__')
exports.desc 	= noop
exports.note 	= noop
exports.assert 	= f => callStack.slice(-1)[0].fn.onReturn = f
exports.error 	= f => callStack.slice(-1)[0].fn.onError = f

exports.param = val => __Type => {
	if (typeCheck(val, __Type)) {
		return noop
	}
	const {valueTypeName, expectedTypeName} = typeCheck.failureDetail(val, __Type)
	throw new TypeError(
		error.paramType(expectedTypeName, valueTypeName, new Error())
	)
}

exports.returns = Type => {
	callStack.slice(-1)[0].fn.type = val => {
		if (typeCheck(val, Type)) {
			return noop
		}
		const {valueTypeName, expectedTypeName} = typeCheck.failureDetail(val, Type)
		throw new TypeError(
			error.returnType(expectedTypeName, valueTypeName, new Error())
		)
	}
}

// Dynamically export the types at the top-level.
Object.keys(exports.types).forEach(key => exports[key] = exports.types[key])
