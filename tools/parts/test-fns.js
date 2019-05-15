global.aro.testFns = (() => {
	const test = f => state.tests.push(f)
	const mock = f => mock => state.mocks.set(f.__inner__, mock)
	const runTests = () => {
		let count = 0
		const nextTest = () => {
			state.mocks.clear()
			if (state.tests.length) {
				count++
				const test = state.tests.shift()
				test(nextTest)
			} else {
				console.log(`Ran ${count} tests.`)
				global.aro.main()
			}
		}
		nextTest()
	}
	return {test, mock, runTests}
})()