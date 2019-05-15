import {dirname} from 'path'
import fs from 'fs'
const dir = dirname(import.meta.url.slice(7))

export default name => {
	const fname = `${dir}/parts/${name}.js`
	const file = fs.readFileSync(fname, 'utf8').trim()
	return file + ';\n\n'
}