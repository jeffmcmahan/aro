'use strict'

const Void = require('./Void')

module.exports = type => class Maybe {
	
	static permits (valueType) {
		return ((valueType === type) || (valueType === Void))
	}
	
	static getName() {
		return 'Maybe(' + type.name + ')'
	}
}
