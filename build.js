import {dirname, join, basename} from 'path'
import sh from './utils/sh.js'
import {writeFile, readFile, stat, readdir} from './utils/fs.js'
import generateTools from './tools/generate.js'
const log = console.log

const isMain = (root, fname) => {

	// Determine whether the given fname points to root index.js.

	const relFname = fname.slice(root.length)
	return (relFname === '/src/index.js')
}

const read = async dir => {

	// Recursively reads the given directory and returns an array
	// of absolute file paths (no directory paths).

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

const prefix = (root, srcDir, outputDir, fname, content) => {

	// Add definitions for local, main, and an import of the tools.

	const relFname = fname.slice(srcDir.length)
	const isTest = fname.endsWith('.test.js')
	const prefixes = []
	if (isTest) {
		const id = relFname.slice(0, -8) + '.js'
		prefixes.push(`const local = global.aro['${id}']`)
		prefixes.push('const {test, mock} = global.aro.testFns')
		prefixes.push(`import * as module from './${basename(id)}'`)
	} else {
		prefixes.push(`const local = global.aro['${relFname}']`)
		if (isMain(root, fname)) {
			prefixes.push('let main = () => {}')
			prefixes.push(`import './aro-tools.js'`)
		}
	}
	return content.replace(`'use aro'\n`, prefixes.join('; ') + '\n')
}

const copyMain = (rootDir, fname, content) => {

	// Add a statement to make main accessible from elsewhere.

	return isMain(rootDir, fname)
		? (content + '\nglobal.aro.main = main') 
		: content
}

const addTests = (rootDir, fname, content) => {

	// Add a statement to include all the test files.

	return isMain(rootDir, fname)
		? content + `\nimport './aro-tests.js'\nglobal.aro.testFns.runTests()` 
		: content
}

const safelyWriteFile = async (outputFname, content) => {

	// Write the given file to disk, ensuring that the parent dir
	// exists beforehand.

	await sh(`mkdir -p ${dirname(outputFname)}`).catch(log)
	await writeFile(outputFname, content).catch(log)
}

const createTestFile = (srcDir, outputDir, fnames) => {

	// Generates and saves a file which imports all the test files.

	const srcFnames = fnames.filter(fname => fname.endsWith('.test.js'))
	const relativeFnames = srcFnames.map(fname => fname.slice(srcDir.length))
	const importStatements = relativeFnames.map(fname => `import '.${fname}'`)
	const testsFname = join(outputDir, 'aro-tests.js')
	return writeFile(testsFname, importStatements.join('\n')).catch(log)
}

const createToolsFile = (fnames, srcDir, outputDir, mode) => {

	// Generate the tools code.

	const toolsFname = join(outputDir, `aro-tools.js`)
	const toolsCode = generateTools(srcDir, fnames, mode)
	return writeFile(toolsFname, toolsCode).catch(log)
}

export default async (mode, root) => {

	// Modify then copy src files to the ./aro-dev and ./aro-prod directories.

	const srcDir = join(root, 'src')
	const outputDir = join(root, mode)
	
	// Clear/create the output directory.
	await sh(`rm -rf ${outputDir} && mkdir ${outputDir}`).catch(log)

	// Read files, transform if required, and save to outputDir.
	let fnames = await read(srcDir)

	// Remove test files if in production mode.
	if (mode === 'production') {
		fnames = fnames.filter(fname => !fname.endsWith('.test.js'))
	}

	await Promise.all(fnames.map(async fname => {
		let content = await readFile(fname, 'utf8').catch(log)
		content = prefix(root, srcDir, outputDir, fname, content)
		content = copyMain(root, fname, content)
		if (mode === 'development') {
			content = addTests(root, fname, content)
		} else {
			content = removeCalls(content)
			if (isMain(root, fname)) {
				content += '\nglobal.aro.main()'
			}
		}
		const outputFname = join(outputDir, fname.slice(root.length + 4))
		await safelyWriteFile(outputFname, content).catch(log)
	}))

	// Generate Aro-specific files that will be included.
	await createTestFile(srcDir, outputDir, fnames).catch(log)
	await createToolsFile(fnames, srcDir, outputDir, mode)
}