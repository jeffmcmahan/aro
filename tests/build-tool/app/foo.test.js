module.exports.test(done => {
	document.body.innerHTML += 'Test 1 ran. '
	done()
})

module.exports.test(done => {
	document.body.innerHTML += 'Test 2 ran. '
	done()
})
