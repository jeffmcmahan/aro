import {types, fn, param, precon, returns, postcon, __test__returns__js as local} from '/Users/jeff/dev/personal/aro/tests/test-backend/development/aro-tools.js'

export default fn (num => {
	
	// Have to get weird to make this output depend on num...
	returns	((num === 5) ? String : Array)

	return 'tested: returns'
})
