'use strict'

const assert = require('assert')
const {fn, param, returns, Any, T} = require('../../index')

const test1 = fn (() => {

	// A function that will always throw for return type.

	returns (String)

	return 1
})

assert.throws(test1, ({message}) => {
	const firstStackLn = (
		message.split('\n').map(ln => ln.trim()).filter(ln => !ln.indexOf('at ')).shift()
	)
	return firstStackLn.includes('getActual')
})

const test2 = fn (arg => {

	// A function that will always throw for return type.

	param	(arg)(String)

})

assert.throws(() => test2(1), ({message}) => {
	const firstStackLn = (
		message.split('\n').map(ln => ln.trim()).filter(ln => !ln.indexOf('at ')).shift()
	)
	return firstStackLn.includes('at Object.arg ')
})

const deepFreeze = fn (v => {

	// Lets make sure that recursion works.

	param	(v)(Any)
	returns	(T(v))

	Object.keys(v).forEach(key => {
		const value = v[key]
		if (value && typeof value === 'object') {
			deepFreeze(value)
		}
	})
	return Object.freeze(v)
})

assert.doesNotThrow(() => deepFreeze([{}, {}, {}]))
