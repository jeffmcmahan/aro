'use aro'

const fs = require('fs')
const testParam = require('./test-param')
const testReturns = require('./test-returns')
const testPrecon = require('./test-precon')
const testPostcon = require('./test-postcon')
const testNesting = require('./nested/test-nesting')

local.funcToBeMocked = fn (() => {
	throw new Error('Mock did not run.')
})

main = fn (() => {

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
	fs.writeFileSync(__dirname + '/results.json', JSON.stringify(results, null, 2))
})
