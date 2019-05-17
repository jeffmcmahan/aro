const local = global.aro['/foo.js']; const {test, mock} = global.aro.testFns; import * as module from './foo.js'

test(done => {
	console.log(':)')
	done()
})