'use strict'

const check = require('./type-check')
const callStack = require('./call-stack')
const noop = () => void 0

// API surface
exports.types 	= require('./types')
exports.fn 		= require('./fn')
exports.desc 	= noop
exports.note 	= noop
exports.assert 	= f => callStack.slice(-1)[0].fn.onReturn = f
exports.error 	= f => callStack.slice(-1)[0].fn.onError = f
exports.param 	= val => Type => (check('param')(Type)(val), noop)
exports.returns = Type => (
	callStack.slice(-1)[0].fn.type = check('function')(Type),
	noop
)

// Dynamically export the types at the top-level.
Object.keys(exports.types).forEach(key => exports[key] = exports.types[key])
