import {types} from '/Users/jeff/dev/personal/aro/tests/test-backend/production/aro-tools.js'; const local = {}; let main = () => {}

import {dirname} from 'path'
import {writeFileSync} from 'fs'
import testParam from './test-param.js'
import testReturns from './test-returns.js'
import testPrecon from './test-precon.js'
import testPostcon from './test-postcon.js'
import testNesting from './nested/test-nesting.js'

local.funcToBeMocked = /*fn*/ (() => {
	throw new Error('Mock did not run.')
})

main = /*fn*/ (() => {

	// NOTICE: *.test.js files print to stdout, which is also checked.

	let results = []
	
	if (process.argv[2] === '--prod-arg') {
		results = [
			testParam(),
			testReturns(),
			testPrecon(),
			testPostcon(),
			testNesting()
		]
	}
	if (process.argv[2] === '--dev-arg') {
		results = [
			testParam(5),
			testReturns(5),
			testPrecon(5),
			testPostcon(5),
			testNesting()
		]
	}

	results.push('tested: main')

	// Record the results on the disk to be examined.

	const dir = dirname(import.meta.url.slice(7))
	writeFileSync(dir + '/results.json', JSON.stringify(results, null, 2))
})

main()