'use strict'

// Just throw if the condition is false.
module.exports = ((condition, ...args) => {
	if (!condition) {
		throw new Error('Test failed.')
		// Todo: Serialize the function to create a nice message.
	}
})

exports.pre = condition => {
	if (!condition) {
		throw new Error('A preconditon failed.')
	}
}
