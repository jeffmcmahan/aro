export default (rootRelPath) => {

	// Translates the given absolute path to a unique identifier that
	// is a legal variable name.

	if (rootRelPath.endsWith('.test.js')) {
		rootRelPath = rootRelPath.slice(0, -8) + '.js'
	}
	return rootRelPath.replace(/[^a-z0-9_]/gi, '__')
}