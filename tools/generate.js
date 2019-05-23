import include from './include.js'
import fileId from '../utils/file-id.js'

export default (srcDir, outputFnames, mode) => {

	// Build a file that defines the appropriate globals.

	let file = ''
	file += include('protocheck')
	if (mode === 'development') {
		file += include('increase-stack-ln')
		file += include('state')
		outputFnames.forEach(fname => {
			if (!fname.endsWith('.test.js')) {
				const rootRel = fname.slice(srcDir.length)
				file += `export const ${fileId(rootRel)} = {};\n`
			}
		})
		file += include('fn')
		file += include('checkers')
		file += include('test-fns')
	}

	// Wrap and return.
	return file.trim()
}