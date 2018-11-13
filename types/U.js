'use strict'

module.exports = (...types) => {

	if (types.length < 2) {
		throw new TypeError('A Union type must combine 2 or more types.')
	}
	
	return class Maybe {
	
		static permits (valueType) {
			return types.includes(valueType)
		}

		static getName() {
			return 'U(' + types.map(type => type.name).join(', ') + ')'
		}
	}
}