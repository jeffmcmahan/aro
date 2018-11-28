'use strict'

const {success, fail} = require('./utils')
const {fn, desc, param, returns} = require('..')
const dict = Object.create(null)

const test1 = fn (() => {

	desc	('Return type.')
	returns	(String)

	return ''
})

success(test1)

const test2 = fn (foo => {

	desc	('Parameter type.')
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
