import include from './include.js'

export default (srcDir, outputFnames, mode) => {

	// Build a file that defines the appropriate globals.

	let file = ''
	file += include('global-aro')
	outputFnames.forEach(fname => {
		if (!fname.endsWith('.test.js')) {
			const rootRel = fname.slice(srcDir.length)
			file += `global.aro['${rootRel}'] = {};\n`
		}
	})
	file += include('protocheck')
	if (mode === 'development') {
		file += include('increase-stack-ln')
		file += include('state')
		file += include('fn')
		file += include('checkers')
		file += include('test-fns')
	}

	// Wrap and return.
	return `var global = (1,eval)('this');if('window' in global){window.global=global}\n\n` + file.trim()
}