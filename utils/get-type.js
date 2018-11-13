'use strict'

const types = require('../types')

module.exports = val => {
	if (val === void 0) {
		return types.Void
	}
	if (val === null) {
		return types.Null
	}
	if (!val.constructor) {
		return types.Dictionary
	}
	return val.constructor
}