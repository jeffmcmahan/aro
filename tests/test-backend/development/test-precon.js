const local = global.aro['/test-precon.js']

export default fn (num => {
	
	precon(() => num === 5)

	return 'tested: precon'
})