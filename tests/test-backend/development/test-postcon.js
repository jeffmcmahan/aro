import {types, fn, param, precon, returns, postcon, __test__postcon__js as local} from '/Users/jeff/dev/personal/aro/tests/test-backend/development/aro-tools.js'

export default fn (num => {
	
	postcon(r => (num === 5) && (r.length === 15))

	return 'tested: postcon'
})
