'use strict'

const {success, fail} = require('./utils')
const {fn, param, returns} = require('../../index')
const dict = Object.create(null)

// Return type.
const test1 = fn (() => {

	returns	(String)

	return ''
})

success(test1)

// Parameter type.
const test2 = fn (foo => {

	param 	(foo)(String)

	return ''
})

success(() => test2(''))
fail(() => test2(), 	'A String parameter was of type undefined')
fail(() => test2(null), 'A String parameter was of type null')
fail(() => test2(2), 	'A String parameter was of type Number')
fail(() => test2(false),'A String parameter was of type Boolean')
fail(() => test2({}), 	'A String parameter was of type Object')
fail(() => test2(dict), 'A String parameter was of type Dictionary')
