export const test = f => state.tests.push(f)

export const mock = f => {
	if (!f || !f.__inner__) {
		console.log(f)
		throw new Error('Mock applies only to fn functions.')
	}
	return mock => state.mocks.set(f.__inner__, mock)
}

export const runTests = main => {
	let count = 0
	const nextTest = () => {
		state.mocks.clear()
		if (state.tests.length) {
			count++
			const test = state.tests.shift()
			test(nextTest)
		} else {
			console.log(`Ran ${count} tests.`)
			main()
		}
	}
	nextTest()
}