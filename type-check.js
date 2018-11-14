'use strict'

const types = require('./types')
const {error, getType} = require('./utils')

const instanceOf = (instanceType, ofType) => {
	if (instanceType === ofType) {
		return true
	}
	if (instanceType.__proto__) {
		return instanceOf(instanceType.__proto__, ofType)
	}
	return false
}

module.exports = context => (expectedType = types.Void) => val => {
	const providedType = getType(val)

	if (expectedType.name === 'Any') {
		return
	}

	if (expectedType.name === 'Maybe') {
		const MaybeType = expectedType
		if (!MaybeType.permits(providedType)) {
			error(context, MaybeType.getName(), providedType.name)
		}
		return
	}

	if (expectedType.name === 'U') {
		const Union = expectedType
		if (!Union.permits(providedType)) {
			error(context, Union.getName(), providedType.name)
		}
		return
	}

	if (expectedType.name === 'Tuple') {
		const Tuple = expectedType
		if (!Tuple.permits(val)) {
			const providedTypeName = Array.isArray(val)
				? '[' + val.slice(0,10).map(v => getType(v).name).join(', ') + ']'
				: providedType.name
			error(context, Tuple.getName(), providedTypeName)
		}
		return
	}

	if (!instanceOf(providedType, expectedType)) {
		error(context, expectedType.name, providedType.name)
	}
}