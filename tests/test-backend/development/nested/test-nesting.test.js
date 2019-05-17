const local = global.aro['/nested/test-nesting.js']; const {test, mock} = global.aro.testFns; import * as module from './test-nesting.js'

test(done => {
	console.log('tested: nested test')
	done()
})