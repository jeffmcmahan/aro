'use strict'

const {getType} = require('../utils')

module.exports = (...types) => class Tuple {

	static permits (value) {
		return Array.isArray(value) && (
			types.every((type, i) => (new (getType(value[i]))) instanceof type)
		)
	}

	static getName() {
		return 'Tuple(' + types.map(type => type.name).join(', ') + ')'
	}
}
