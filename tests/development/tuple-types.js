'use strict'

const {success, fail} = require('./utils')
const {fn, desc, Tuple, returns} = require('../../index')

const test1 = fn (() => {

	desc	('Tuple with a String array returned.')
	returns (Tuple(String))

	return ['']
})

success(test1)

const test2 = fn (() => {

	desc	('Tuple with a Number and String array returned.')
	returns (Tuple(String, Number))

	return ['', 0]
})

success(test2)

const test3 = fn (() => {

	desc	('Tuple with the types reversed.')
	returns (Tuple(String, Number))

	return [0, '']
})

fail(test3, 'Function of type Tuple(String, Number) returned an Array')

const test4 = fn (() => {

	desc	('Tuple with a plain Boolean returned.')
	returns (Tuple(String, Number))

	return false
})

fail(test4, 'Function of type Tuple(String, Number) returned a Boolean')
