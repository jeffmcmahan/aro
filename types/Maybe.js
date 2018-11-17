'use strict'

const Void = require('./Void')

module.exports = (...types) => {

	if (types.length > 1) {
		throw new TypeError('A Maybe type must have 1 constituent type.')
	}

	const type = types[0]
	
	return class Maybe {
	
		static permits (valueType) {
			return ((valueType === type) || (valueType === Void))
		}
		
		static getName() {
			return 'Maybe(' + type.name + ')'
		}
	}
}
