'use strict'

const assert = require('assert')
const {fn, returns, Tuple} = require('../../index')

const test1 = fn (() => {

	// Tuple with a String array returned.

	returns (Tuple(String))

	return ['']
})

assert.doesNotThrow(test1)

const test2 = fn (() => {

	// Tuple with a Number and String array returned.

	returns (Tuple(String, Number))

	return ['', 0]
})

assert.doesNotThrow(test2)

const test3 = fn (() => {

	// Tuple with the types reversed.

	returns (Tuple(String, Number))

	return [0, '']
})

assert.throws(test3, /Function of type Tuple\(String, Number\) returned an Array/)

const test4 = fn (() => {

	// Tuple with a plain Boolean returned.

	returns (Tuple(String, Number))

	return false
})

assert.throws(test4, /Function of type Tuple\(String, Number\) returned a Boolean/)
