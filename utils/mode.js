'use strict'

// Determines whether the tool should be on or off, depending on
// the environment and some flags/variables/etc.
module.exports = () => {
	const browser = (typeof process === 'undefined') || !process.release
	if (browser) {
		return window['--development'] ? 'on' : 'off'
	} else {
		const nodeInspect = process.execArgv.some(arg => arg.includes('--inspect-brk='))
		const nodeEnv = process.env.NODE_ENV === 'development'
		const devFlag = process.argv.includes('--development')
		return (nodeInspect || nodeEnv || devFlag) ? 'on' : 'off'
	}
}
