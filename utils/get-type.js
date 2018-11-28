'use strict'

const types = require('../types')

module.exports = v => (
		(v === void 0) 		? types.Void
	: 	(v === null) 		? types.Null
	:	(!v.constructor) 	? types.Dictionary
	: 	(v.constructor)
	// Need to rethink how this works ... again.
	// Because no way to have "object" work properly.
	// Need a way of accurately 2-way mapping types and values.
	// Which is complicated.
)
