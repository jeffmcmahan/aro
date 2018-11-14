'use strict'

const {success, fail} = require('./utils')
const {fn, param, returns} = require('..')
const dict = Object.create(null)

// Return type.
success(fn (() => {

	returns(String)

	return ''
}))

// Parameter type.
const func = fn (foo => {

	param (foo)(String)

	return ''
})

success(() => func(''))
fail(() => func(), 		'A String parameter was of type Void')
fail(() => func(null), 	'A String parameter was of type Null')
fail(() => func(2), 	'A String parameter was of type Number')
fail(() => func(false), 'A String parameter was of type Boolean')
fail(() => func({}), 	'A String parameter was of type Object')
fail(() => func(dict), 	'A String parameter was of type Dictionary')