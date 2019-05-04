const error = (() => {
	const massNouns = ['void', 'null', 'undefined']
	const vowels = 'aeiou'
	const capitalize = str => str.slice(0,1).toUpperCase() + str.slice(1)

	const addArticle = (noun, caps = false) => {

		// Prepends "a", "an", or nothing to a noun, as appropriate.

		const _noun = ('' + noun).toLowerCase().replace(/[^a-z]/g, '')
		if (massNouns.includes(_noun)) {
			return noun
		}
		const detPhrase = vowels.includes(_noun[0]) ? `an ${noun}` : `a ${noun}`
		return caps ? capitalize(detPhrase) : detPhrase
	}

	const fn = () => {

		// Reconstructs the function's source string.

		let src = state.callStack.slice(-1)[0].fn.toString()
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
			return src
		}
	}

	const returnType = (expected, actual, err) => {
		return (
			`Function of type ${expected} returned ${addArticle(actual)}.\n\n`+
			fn() + '\n\n' +
			(err.stack || err.message)
		)
	}

	const paramType = (expected, actual, err) => {
		return (
			`${addArticle(expected, true)} parameter was of type ${actual}.\n\n`+
			fn() + '\n\n' +
			(err.stack || err.message)
		)
	}

	return {returnType, paramType}
})()

global.param = val => __Type => {
	if (!protocheck(val, __Type)) {
		const {valueTypeName, expectedTypeName} = (
			protocheck.failureDetail(val, __Type)
		)
		throw new TypeError(
			error.paramType(expectedTypeName, valueTypeName, new Error())
		)
	}
}

global.precon = f => {
	const call = state.callStack.slice(-1)[0]
	try {
		if (!f()) {
			throw new Error(
				`Precondition ${f.toString()} failed in: fn (${call.fn.toString()})`
			)
		}
	} catch (e) {
		console.log(e)
		throw new Error(
			`Precondition ${f.toString()} failed in: fn (${call.fn.toString()})`
		)
	}
}

global.returns = __Type => {
	state.callStack.slice(-1)[0].returns = val => {
		if (!protocheck(val, __Type)) {
			const {valueTypeName, expectedTypeName} = protocheck.failureDetail(val, __Type)
			throw new TypeError(
				error.returnType(expectedTypeName, valueTypeName, new Error())
			)
		}
	}
}

global.postcon = f => {
	const call = state.callStack.slice(-1)[0]
	const conditionCheck = returnVal => {
		if (!f(returnVal)) {
			throw new Error(
				`Post-condition ${f.toString()} failed in: fn (${call.fn.toString()})`
			)
		}
	}
	state.callStack.slice(-1)[0].post.push(conditionCheck)
}