'use strict'

const {getType} = require('../utils')

module.exports = (...types) => {

	if (types.length === 0) {
		throw new TypeError(
			'A Tuple type must have at least 1 constituent type.'
		)
	}

	return class Tuple {

		static permits (value) {
			return Array.isArray(value) && (
				types.every((type, i) => (
					new (getType(value[i]))) instanceof type
				)
			)
		}
	
		static getName() {
			return 'Tuple(' + types.map(type => type.name).join(', ') + ')'
		}
	}
}
