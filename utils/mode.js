'use strict'

module.exports = () => {
	if ((typeof process !== 'undefined') && (process.release.name === 'node')) {
		const nodeInspect = process.execArgv.some(arg => arg.includes('--inspect-brk='))
		const nodeEnv = process.env.NODE_ENV === 'development'
		const devFlag = process.argv.includes('--development')
		return (nodeInspect || nodeEnv || devFlag)
			? 'on'
			: 'off'
	} else {
		return window['--development'] ? 'on' : 'off'
	}
}
