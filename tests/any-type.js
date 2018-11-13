'use strict'

const {success} = require('./utils')
const {fn, desc, param, Any} = require('..')
let func

/// TYPE: Any /////////////////////////////////////////////////////////////////////////////////////

func = fn (Any) (foo => {

	desc  ('This should always work. There are no checks.')
	param (foo)(Any)
	
	return new Date()
})

success(func)
success(() => func(0))
success(() => func(true))
success(() => func({}))
