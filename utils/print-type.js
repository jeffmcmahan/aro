'use strict'

const types = require('../types')

module.exports = val => {
	if (val === null) {
		return 'null'
	}
	if (val === void 0) {
		return 'undefined'
	}
	if (typeof val === 'object' && !val.constructor) {
		return 'Dictionary'
	}
	if (Object.values(types).includes(val)) {
		return val.name
	}
	return val.constructor.name
}