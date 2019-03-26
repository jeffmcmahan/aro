func.test(done => {
	syncTestRan++
	done()
})

asyncFunc.test(async (done) => {
	asyncTestRan++
	done()
})

runTests().then(async () => {
	
	// Make the sure the test has already run.
	assert.equal(syncTestRan, 1)
	assert.equal(syncFuncRan, 0)

	// Make sure that calling the function does not trigger the test.
	func()
	assert.equal(syncTestRan, 1)
	assert.equal(syncFuncRan, 1)

	await asyncFunc()
	assert.equal(asyncFuncRan, 1)
	assert.equal(asyncTestRan, 1)
}).catch(console.log)
