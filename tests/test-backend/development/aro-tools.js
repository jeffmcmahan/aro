const protocheck = (() => {

	const hmac = '8972bac721df873b'

	const protoCheck = (() => {
		const objProto = Object.prototype
		const getProto = v => (v == null)
			? v
			: (Object.getPrototypeOf || (v => v.__proto__))(v)
		const nonObjects = [
			Boolean, Symbol, String, Number, Array, Function
		].map(v => v.prototype)

		return (proto, v) => {
			let ignoreObj
			let vProto = getProto(v)
			while (vProto) {
				if (nonObjects.includes(vProto)) {
					ignoreObj = true
				}
				if (vProto === proto) {
					return (ignoreObj && proto === objProto) 
						? !!getProto(vProto)
						: true
				}
				vProto = getProto(vProto)
			}
			return false
		}
	})()

	const typeCheck = (v, Type) => {
		// Wrapper facade to expose the prototypes
		if (Type && Type.hmac === hmac) {
			return Type(v)
		}
		if (v == null && v !== Type) {
			return false
		}
		return protoCheck(Type.prototype, v)
	}

	typeCheck.types = (() => {
		// Reconstruct type check name, like "Maybe(String)"
		const typeNames = types => (
			types.map(type => type.hmac ? type.__desc : type.name).join(', ')
		)

		const valueType = value => (
				value == null ? value
			: 	value.constructor ? value.constructor.name
			:	value.constructor
		)

		// Any type just allows everything.
		const Any = () => true
		Any.__desc = 'Any'
		Any.hmac = hmac

		// Undeinfed type for undefined value only.
		const Undefined = v => v === (void 0)
		Undefined.__desc = 'Undefined'
		Undefined.hmac = hmac

		// Null type for null value only.
		const Null = v => v === null
		Null.__desc = 'Null'
		Null.hmac = hmac

		// Dictionaries, i.e.: Object.create(null)
		const Dictionary = v => v && (v.__proto__ === void 0)
		Dictionary.__desc = 'Dictionary'
		Dictionary.hmac = hmac

		// Unions work if any of the types given is satisfied.
		const U = (...types) => {
			const test = v => types.some(t => typeCheck(v, t))
			test.hmac = hmac
			test.__desc = 'U(' + typeNames(types) + ')'
			return test
		}

		// Maybe is a Union with Void added to the list.
		const Maybe = (...types) => {
			const test = U(...types, Void)
			test.__desc = 'Maybe(' + typeNames(types) + ')'
			return test
		}

		// Void is Union of null and undefined.
		const Void = U(Null, Undefined)
		Void.__desc = 'Void'

		// Tuples are array of a given length with items of given types.
		const Tuple = (...types) => {
			const test = v => (
				typeCheck(v, Array) &&
				types.length === v.length &&
				types.every((type, i) => typeCheck(v[i], type))
			)
			test.__desc = 'Tuple(' + typeNames(types) + ')'
			test.hmac = hmac
			return test
		}

		// T is a generic type (takes the type of a value) to check a value.
		const T = v1 => {
			let proto = (v1 == null) ? v1 : v1.__proto__
			const test = v2 => ((v1 == null && v1 === v2) || protoCheck(proto, v2))
			test.__desc = 'T(' + valueType(v1)  + ')'
			test.hmac = hmac
			return test
		}

		// ArrayT is an array generic type (string array is Array(String).
		const ArrayT = type => {
			const test = arr => (
				typeCheck(arr, Array) && 
				arr.every(val => typeCheck(val, type))
			)
			test.__desc = 'ArrayT(' + typeNames([type])  + ')'
			test.hmac = hmac
			return test
		}

		return {
			Any, Undefined, Null, Void, Dictionary, Maybe, Tuple, U, T, ArrayT
		}
	})()

	typeCheck.failureDetail = (value, expectedType) => {
		if (typeCheck(value, expectedType)) {
			return null
		}
		const expectedTypeName = expectedType.hmac 
			? expectedType.__desc 
			: expectedType.name
		const valueTypeName = '' + (
				value == null ? value
			: 	value.constructor ? value.constructor.name
			:	'Dictionary'
		)
		return {expectedTypeName, valueTypeName}
	}

	return typeCheck
})()

export const types =  protocheck.types;

if (Error.stackTraceLimit < 100) {
	Error.stackTraceLimit = 100
};

const state = {
	mocks: new Map,
	callStack: [],
	tests: []
};

export const __index__js = {};
export const __nested__test__nesting__js = {};
export const __package__json = {};
export const __test__param__js = {};
export const __test__postcon__js = {};
export const __test__precon__js = {};
export const __test__returns__js = {};
export const fn = (() => {
	
	const isAsync = f => /^async[\s\(]/.test(f.toString().trim())

	return f => {

		// Note whether it uses the "async" keyword.
		const _isAsync = isAsync(f)

		// Return the wrapper function that gets called.
		const fn = ((...args) => {
			const call = {
				args,
				fn: (state.mocks.get(f) || f),
				pre: 0,
				post: []
			}
			state.callStack.push(call) // Add the invocation to the call stack.

			// Execute the function and save the result.
			// This is done inline to avoid bloating the stack trace.

			let result
			if (_isAsync) {
				result = new Promise((resolve, reject) => {
					call.fn(...args).then(resolved => {
						state.callStack.push(call)
						if (call.type) {
							(call.type(resolved))
						}
						if (call.post.length) {
							call.post.forEach(postCond => postCond(resolved))
						}
						resolve(resolved)
						state.callStack.pop()
					}).catch(err => {
						state.callStack.push(call)
						reject(err)
						state.callStack.pop()
					})
				})
			} else {
				result = call.fn(...args)
				if (call.returns) {
					(call.returns(result))
				}
				if (call.post.length) {
					call.post.forEach(cond => cond(result))
				}
			}
			
			state.callStack.pop() // Remove from the call stack.
			return result
		})

		// Keep a reference to the inner func to look up mocks.
		fn.__inner__ = f

		return fn
	}
})();

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

export const param = val => __Type => {
	if (!protocheck(val, __Type)) {
		const {valueTypeName, expectedTypeName} = (
			protocheck.failureDetail(val, __Type)
		)
		throw new TypeError(
			error.paramType(expectedTypeName, valueTypeName, new Error())
		)
	}
}

export const precon = f => {
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

export const returns = __Type => {
	state.callStack.slice(-1)[0].returns = val => {
		if (!protocheck(val, __Type)) {
			const {valueTypeName, expectedTypeName} = protocheck.failureDetail(val, __Type)
			throw new TypeError(
				error.returnType(expectedTypeName, valueTypeName, new Error())
			)
		}
	}
}

export const postcon = f => {
	const call = state.callStack.slice(-1)[0]
	const conditionCheck = returnVal => {
		if (!f(returnVal)) {
			throw new Error(
				`Post-condition ${f.toString()} failed in: fn (${call.fn.toString()})`
			)
		}
	}
	state.callStack.slice(-1)[0].post.push(conditionCheck)
};

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
};