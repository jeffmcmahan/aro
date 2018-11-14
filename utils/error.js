'use strict'

const callStack = require('../call-stack')

const fn = () => {
	let src = callStack.slice(-1)[0].fn.toString()
	if (!src.includes('\n')) {
		return '\t' + src.trim()
	} else {
		src = src.replace(/[ ]{2}/g, '\t')
		const lines = src.split('\n')
		const tabDepth = lines.slice(-1)[0].replace(/^(\t+)/, '$1').length
		const remove = ''.padStart((tabDepth - 1), '\t')
		lines.forEach((line, i) => {
			lines[i] = line.replace(remove, '')
		})
		src = '\t(' + lines.join('\n\t') + ')'
		return src.replace(/\t/g, '    ')
	}
}

const filterStack = stack => {
	return stack.split('\n').filter(ln => !(
		ln.includes('/aro/fn.js') ||
		ln.includes('/aro/utils/error.js') ||
		ln.includes('/aro/type-check.js')
	)).slice(1).join('\n') + '\n\n    Original Stack:\n'
}

const returnTypeMsg = (expected, provided) => {
	return `Function of type ${expected} returned ${provided}:\n\n${fn()}\n`
}

const paramTypeMsg = (expected, provided) => {
	return `A ${expected} parameter was of type ${provided} in:\n\n${fn()}\n`
}

module.exports = (context, expected, provided) => {
	if (context === 'function') {
		const msg = returnTypeMsg(expected, provided)
		const e = new TypeError()
		throw new TypeError(msg + '\n' + filterStack(e.stack))
	}
	if (context === 'param') {
		const msg = paramTypeMsg(expected, provided)
		const e = new TypeError()
		throw new TypeError(msg + '\n' + filterStack(e.stack))
	}
}
