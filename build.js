import {dirname, join, basename} from 'path'
import sh from './utils/sh.js'
import {writeFile, readFile, stat, readdir} from './utils/fs.js'
import generateTools from './tools/generate.js'
import fileId from './utils/file-id.js'
const log = console.log

const isMain = (root, fname) => {

	// Determine whether the given fname points to root index.js.

	const relFname = fname.slice(root.length)
	return (relFname === '/src/index.js')
}

const read = async dir => {

	// Recursively reads the given directory and returns an array of
	// absolute file paths (no directory paths).

	const items = (await readdir(dir))
		.filter(f => !f.startsWith('.'))
		.filter(fname => !fname.split('/').includes('node_modules'))
		.map(f => join(dir, f))

	const files = []
	for (let fspath of items) {
		const itemStat = await stat(fspath).catch(log)
		if (itemStat.isDirectory()) {
			files.push(...(await read(fspath).catch(log)))
		} else {
			files.push(fspath)
		}
	}
	return files
}

const removeCalls = content => {

	// Comments out calls to fn, param, returns, etc.

	return content
		.replace(/\b(param\s*?\()/g, '// $1')
		.replace(/\b(precon\s*?\()/g, '// $1')
		.replace(/\b(returns\s*?\()/g, '// $1')
		.replace(/\b(postcon\s*?\()/g, '// $1')
		.replace(/\bfn(\s*?)\(/g, '/*fn*/$1(')
}

const addDevContext = (fname, isMain, isTest, toolsPath, id) => {

	// Provides arrays of javascript statements to prepend and append to
	// a file, to enable the tools and tests.

	let prefix = []
	let postfix = []
	if (isMain) { // index.js
		const tools = `types, fn, param, precon, returns, postcon, ${id} as local, runTests`
		prefix = [
			`new Function('this.ARO_ENV = \\'development\\'')()`,
			`import {${tools}} from '${toolsPath}'`,
			'let main = () => {}',
		]
		postfix = [
			'import(\'./aro-tests.js\')'+
				'.then(async ({defineTests}) => defineTests()'+
				'.then(() => runTests(main)))'
		]
	} else if (isTest) { // *.test.js
		prefix = [
			`import {types, test, mock, ${id} as local} from '${toolsPath}'`,
			`import * as module from './${basename(fname.slice(0, -8)) + '.js'}'`
		]
	} else { // *.js
		const tools = `types, fn, param, precon, returns, postcon, ${id} as local`
		prefix = [
			`import {${tools}} from '${toolsPath}'`,
		]
	}
	return {prefix, postfix}
}

const addProdContext = (isMain, toolsPath) => {

	// Provides arrays of javascript statements to prepend and append to
	// a file, sensitive to whether it is the main file or not.

	let prefix = []
	let postfix = []
	if (isMain) {
		prefix = [
			`new Function('this.ARO_ENV = \\'production\\'')()`,
			`import {types} from '${toolsPath}'`,
			'const local = {}',
			'let main = () => {}'
		]
		postfix = ['main()']
	} else {
		prefix = [
			`import {types} from '${toolsPath}'`,
			'const local = {}'
		]
	}
	return {prefix, postfix}
}

const safelyWriteFile = async (outputFname, content) => {

	// Write the given file to disk, ensuring that the parent dir
	// exists beforehand.

	await sh(`mkdir -p "${dirname(outputFname)}"`).catch(log)
	await writeFile(outputFname, content).catch(log)
}

const createTestFile = (srcDir, outputDir, fnames) => {

	// Generates and saves a file which imports all the test files.

	const srcFnames = fnames.filter(fname => fname.endsWith('.test.js'))
	const relativeFnames = srcFnames.map(fname => fname.slice(srcDir.length))
	const imports = relativeFnames.map(fname => `import('.${fname}')`).join(',\n')
	const code = `export const defineTests = () => Promise.all([\n${imports}\n])`
	const testsFname = join(outputDir, 'aro-tests.js')
	return writeFile(testsFname, code).catch(log)
}

const createToolsFile = (fnames, srcDir, outputDir, mode) => {

	// Generate the tools code.

	const toolsFname = join(outputDir, `aro-tools.js`)
	const toolsCode = generateTools(srcDir, fnames, mode)
	return writeFile(toolsFname, toolsCode).catch(log)
}

const cp = async (src, dest) => {

	// Safely copy a single file from src to dest.
	// Notice: Node's fs.copyFile() does not handle exotic filenames.

	await sh(`mkdir -p "${dirname(dest)}"`).catch(log)
	await sh(`cp "${src}" "${dest}" `)
}

export default async (mode, root) => {

	// Modify then copy src files to the ./aro-dev and ./aro-prod directories.

	const srcDir = join(root, 'src')
	const outputDir = join(root, mode)
	
	// Clear/create the output directory.
	await sh(`rm -rf "${outputDir}" && mkdir "${outputDir}"`).catch(log)

	// Read files, transform if required, and save to outputDir.
	let fnames = await read(srcDir)

	// Remove test files if in production mode.
	if (mode === 'production') {
		fnames = fnames.filter(fname => !fname.endsWith('.test.js'))
	}

	await Promise.all(fnames.map(async fname => {
		const outputFname = join(outputDir, fname.slice(root.length + 4))
		
		// If not js, just copy the file straight up.
		if (!fname.endsWith('.js')) {
			return cp(fname, outputFname).catch(console.log)
		}
		
		// Read the file and determine what sort of file it is.
		let content = await readFile(fname, 'utf8').catch(log)
		const isAro = content.includes('\'use aro\'')
		const _isMain = isMain(root, fname)
		const _isTest = fname.endsWith('.test.js')
		const id = fileId(fname.slice(srcDir.length))
		
		// Generate code to precede and follow the src code.
		var prefix = []
		var postfix = []
		const toolsPath = join(outputDir, 'aro-tools.js')
		if (isAro && mode === 'development') {
			var {prefix, postfix} = addDevContext(fname, _isMain, _isTest, toolsPath, id)
		} else if (isAro) {
			var {prefix, postfix} = addProdContext(_isMain, toolsPath)
			content = removeCalls(content)
		}
		content = content.replace('\'use aro\'', prefix.join('; ')) + '\n' + postfix.join('; ')

		// Write the JS file to its new location.
		await safelyWriteFile(outputFname, content).catch(log)
	}))

	// Generate Aro-specific files that will be included.
	await createToolsFile(fnames, srcDir, outputDir, mode)
	if (mode === 'development') {
		await createTestFile(srcDir, outputDir, fnames).catch(log)
	}
}