externallyTested.test(() => {
	tested = true
	return externallyTested() === 1
})

externallyTested.test(() => {
	return false
})
