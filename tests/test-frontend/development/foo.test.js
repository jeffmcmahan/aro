const local = global.aro['/foo.js']; const {test, mock} = global.aro.testFns; import * as src from './foo.js'

test(done => {
	console.log(':)')
	done()
})