import fs from 'fs'

// Simplify promisified APIs
export const stat = fs.promises.stat
export const readFile = fs.promises.readFile
export const writeFile = fs.promises.writeFile
export const readdir = fs.promises.readdir


