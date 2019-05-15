import {join} from 'path'

export default async (mode, root) => {

	// Execute the main file to run the app.

	return await import(join(root, mode, 'index.js'))
}