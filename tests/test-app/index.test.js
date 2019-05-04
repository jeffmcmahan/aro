'use aro';

test(done => {
	mock(local.funcToBeMocked)(() => '\ntested: mock')
	process.stdout.write(local.funcToBeMocked())
	process.stdout.write('\ntested: test')
	done()
})
