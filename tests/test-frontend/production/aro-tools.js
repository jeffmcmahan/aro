var global = (1,eval)('this');if('window' in global){window.global=global}

global.aro = {
	main: () => {}
};

global.aro['/bar/index.js'] = {};
global.aro['/foo.js'] = {};
global.aro['/index.js'] = {};
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

global.types = protocheck.types;