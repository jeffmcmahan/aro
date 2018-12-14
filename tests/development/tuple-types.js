'use strict'

const {success, fail} = require('./utils')
const {fn, Tuple, returns} = require('../../index')

// Tuple with a String array returned.
const test1 = fn (() => {

	returns (Tuple(String))

	return ['']
})

success(test1)

// Tuple with a Number and String array returned.
const test2 = fn (() => {

	returns (Tuple(String, Number))

	return ['', 0]
})

success(test2)

// Tuple with the types reversed.
const test3 = fn (() => {

	returns (Tuple(String, Number))

	return [0, '']
})

fail(test3, 'Function of type Tuple(String, Number) returned an Array')

// Tuple with a plain Boolean returned.
const test4 = fn (() => {

	returns (Tuple(String, Number))

	return false
})

fail(test4, 'Function of type Tuple(String, Number) returned a Boolean')
