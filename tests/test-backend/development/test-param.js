import {types, fn, param, precon, returns, postcon, __test__param__js as local} from '/Users/jeff/dev/personal/aro/tests/test-backend/development/aro-tools.js'

export default fn (num => {

	param	(num)(Number)

	return 'tested: param'
})
