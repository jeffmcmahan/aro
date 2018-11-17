'use strict'

const types = require('../types')

module.exports = v => (
		(v === void 0) 		? types.Void
	: 	(v === null) 		? types.Null
	:	(!v.constructor) 	? types.Dictionary
	: 	(v.constructor)
)
