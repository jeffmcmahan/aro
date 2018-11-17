'use strict'

const nodeAssert = require('assert')
const {fn, returns, desc, param} = require('..')

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
