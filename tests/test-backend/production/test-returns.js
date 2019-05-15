const local = global.aro['/test-returns.js']

export default /*fn*/ (num => {
	
	// Have to get weird to make this output depend on num...
	// returns	((num === 5) ? String : Array)

	return 'tested: returns'
})