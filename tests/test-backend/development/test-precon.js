import {types, fn, param, precon, returns, postcon, __test__precon__js as local} from '/Users/jeff/dev/personal/aro/tests/test-backend/development/aro-tools.js'

export default fn (num => {
	
	precon(() => num === 5)

	return 'tested: precon'
})
