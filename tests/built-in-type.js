'use strict'

const {success, fail} = require('./utils')
const {fn, param, Any} = require('..')
const dict = Object.create(null)

// Return type.
success(fn (String) (() => ''))

// Parameter type.
const func = fn (Any) (foo => {

	param (foo)(String)

	return ''
})

success(() => func(''))
fail(() => func(), 		'Parameter declared as a String was of type Void.')
fail(() => func(null), 	'Parameter declared as a String was of type Null.')
fail(() => func(2), 	'Parameter declared as a String was of type Number.')
fail(() => func(false), 'Parameter declared as a String was of type Boolean.')
fail(() => func({}), 	'Parameter declared as a String was of type Object.')
fail(() => func(dict), 	'Parameter declared as a String was of type Dictionary.')