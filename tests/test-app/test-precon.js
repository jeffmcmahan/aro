'use aro'

module.exports = fn (num => {
	
	precon(() => num === 5)

	return 'tested: precon'
})