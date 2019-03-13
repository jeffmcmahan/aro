'use strict'

module.exports = (() => {

	// A simple container for mutable state information.

	const Public = {
		mode: 'off',
		mocks: new Map,
		callStack: [],
		tests: []
	}

	Public.engine = () => {
		return ((typeof process === 'undefined') || !process.release)
			? 'browser'
			: 'node'
	}

	Public.mode = (() => {

		// Determines whether the tool should be on or off, depending on
		// the environment and some flags/variables/etc.

		if (Public.engine() === 'browser') {
			return window['--development'] ? 'on' : 'off'
		} else {
			const nodeInspect = process.execArgv.some(arg => arg.includes('--inspect-brk='))
			const nodeEnv = process.env.NODE_ENV === 'development'
			const devFlag = process.argv.includes('--development')
			return (nodeInspect || nodeEnv || devFlag) ? 'on' : 'off'
		}
	})()

	return Object.freeze(Public)
})()
