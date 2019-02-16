'use strict'

const callStack = require('../call-stack')
const massNouns = ['void', 'null', 'undefined']
const vowels = 'aeiou'

const capitalize = str => str.slice(0,1).toUpperCase() + str.slice(1)

// Prepends "a", "an", or nothing to a noun, as appropriate.
const addArticle = (noun, caps = false) => {
	const _noun = ('' + noun).toLowerCase().replace(/[^a-z]/g, '')
	if (massNouns.includes(_noun)) {
		return noun
	}
	const detPhrase = vowels.includes(_noun[0]) ? `an ${noun}` : `a ${noun}`
	return caps ? capitalize(detPhrase) : detPhrase
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
const filterStack = stack => {
	const lines = stack.split('\n')
	return lines
		.filter(ln => !ln.includes('__Type'))						// param()
		.filter(ln => !ln.includes('callStack.slice.type.val')) 	// returns()
		.filter(ln => !ln.includes('__fn__'))						// main
		.filter(ln => !ln.includes('(internal/'))					// irrelevant
		.join('\n') + ('\n\n    Original Stack:\n')
}

exports.returnType = (expected, actual, err) => {
	return (
		`Function of type ${expected} returned ${addArticle(actual)}.\n\n` +
		fn() + '\n\n' +
		filterStack(err.stack || err.message)
	)
}

exports.paramType = (expected, actual, err) => {
	return (
		`${addArticle(expected, true)} parameter was of type ${actual}.\n\n` +
		fn() + '\n\n' +
		filterStack(err.stack || err.message)
	)
}