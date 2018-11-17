'use strict'

const callStack = require('../call-stack')
const massNouns = ['void']
const vowels = 'aeiou'

// Prepends "a", "an", or nothing to a noun, as appropriate.
const addArticle = noun => {
	const _noun = noun.toLowerCase().replace(/[^a-z]/g, '')
	return (
			massNouns.includes(_noun) ? noun
		:	vowels.includes(_noun[0]) ? `an ${noun}`
		: 	`a ${noun}`
	)
}

// Reconstructs the function's source string.
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
		src = '\tfn (' + lines.join('\n\t') + ')'
		return src.replace(/\t/g, '    ')
	}
}

// Filters irrelevant lines from the stack trace.
const filterStack = stack => (
	stack
		.split('\n')
		.slice(4)
		.filter(ln => !ln.includes('__fn__'))
		.join('\n') + ('\n\n    Original Stack:\n')
)

// Explains that there was an incorrect return type.
const returnTypeMsg = (expected, provided) => {
	provided = addArticle(provided)
	return `Function of type ${expected} returned ${provided}:\n\n${fn()}\n`
}

// Explains that there was in incorrect parameter type.
const paramTypeMsg = (expected, provided) => (
	`A ${expected} parameter was of type ${provided} in:\n\n${fn()}\n`
)

// Creates an error with a helpful message and stack trace.
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
