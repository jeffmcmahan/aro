'use strict'

// Error Messaging Functions
// const fnSrc = fn => (
// 	(`\t(${fn.toString()})`).split('\n').join('\n\t')
// )

// const returnTypeErrorMsg = (Type, val) => {
// 	const fn = fnSrc(currentState().fn)
// 	return `${Type.name} function returned ${val.constructor.name}:\n\n${fn}\n`
// }

// const genericTypeErrorMsg = (Type, val) => {
// 	const fn = fnSrc(currentState().fn)
// 	return (
// 		`Generic function should have returned ${Type.name}, `+
// 		`but returned ${val.constructor.name}:\n\n${fn}\n`
// 	)
// }

// const paramTypeErrorMsg = (Type, val) => {
// 	const fn = fnSrc(currentState().fn)
// 	const arg = currentState().params
// 	return `Param ${arg}: ${Type.name} param was of type ${val.constructor.name}:\n\n${fn}\n`
// }

// const arityTypeErrorMsg = (expected, provided) => {
// 	const fn = fnSrc(currentState().fn)
// 	return `Function of arity ${expected} called with ${provided} arguments: \n\n${fn}\n`
// }

module.exports = (context, expected, provided) => {
	if (context === 'function') {
		throw new TypeError(`Function of type ${expected} returned a ${provided}.`)
	}
	if (context === 'param') {
		throw new TypeError(`Parameter declared as a ${expected} was of type ${provided}.`)
	}
}
