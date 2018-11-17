'use strict'

const types = require('../types')

module.exports = v => (
		(v === null) 								? 'null'
	:	(v === void 0) 								? 'undefined'
	: 	(typeof v === 'object' && !v.constructor) 	? 'Dictionary'
	: 	(Object.values(types).includes(v)) 			? v.name
	:	(v.constructor.name)
)
