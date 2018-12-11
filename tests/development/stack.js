'use strict'

const nodeAssert = require('assert')
const {fn, returns, desc, param, Any, T} = require('../../index')

const test1 = fn (() => {

	desc	('A function that will always throw for return type.')
	returns (String)

	return 1
})

nodeAssert.throws(test1, ({message}) => {
	const firstStackLn = (
		message.split('\n').map(ln => ln.trim()).filter(ln => !ln.indexOf('at ')).shift()
	)
	return firstStackLn.includes('getActual')
})

const test2 = fn (arg => {

	desc	('A function that will always throw for return type.')
	param	(arg)(String)

})

nodeAssert.throws(() => test2(1), ({message}) => {
	const firstStackLn = (
		message.split('\n').map(ln => ln.trim()).filter(ln => !ln.indexOf('at ')).shift()
	)
	return firstStackLn.includes('at arg ')
})

const deepFreeze = fn (v => {

	desc	('Lets make sure that recursion works.')
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
