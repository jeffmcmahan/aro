const local = global.aro['/index.js']; const {test, mock} = global.aro.testFns; import * as module from './index.js'

import assert from 'assert'

test(done => {

	// Aim: Make sure that test run at all.

	process.stdout.write('\ntested: test')
	done()
})

test(done => {

	// Aim: Make sure that the target file being tested is imported
	// in this test file as "src".

	assert.equal(typeof module, 'object') // In this its just a blank module.
	done()
})

test(done => {

	// Aim: Make sure that local is bound to the same object as in the
	// target file, so that private items can be tested.

	assert.equal(typeof local, 'object')
	assert.equal(typeof local.funcToBeMocked, 'function')
	done()
})

test(done => {

	// Aim: Make sure that 

	mock(local.funcToBeMocked)(() => 'foo')
	assert.equal(local.funcToBeMocked(), 'foo')
	done()
})