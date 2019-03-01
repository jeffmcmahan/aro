'use strict'

const nodeAssert = require('assert')
const {fn, returns, param, Any, T} = require('../../index')

// A function that will always throw for return type.
const test1 = fn (() => {

	returns (String)

	return 1
})

nodeAssert.throws(test1, ({message}) => {
	const firstStackLn = (
		message.split('\n').map(ln => ln.trim()).filter(ln => !ln.indexOf('at ')).shift()
	)
	return firstStackLn.includes('getActual')
})

// A function that will always throw for return type.
const test2 = fn (arg => {

	param	(arg)(String)

})

nodeAssert.throws(() => test2(1), ({message}) => {
	const firstStackLn = (
		message.split('\n').map(ln => ln.trim()).filter(ln => !ln.indexOf('at ')).shift()
	)
	return firstStackLn.includes('at Object.arg ')
})

// Lets make sure that recursion works.
const deepFreeze = fn (v => {

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

nodeAssert.doesNotThrow(() => deepFreeze([{}, {}, {}]))
