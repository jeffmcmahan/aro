'use strict'

const protocheck = require('protocheck') // Test third party includes.
const {runTests} = require('../../../index.js')
const foo = require('./foo')
const bar = require('./nested/bar')

runTests().then(() => {
	setTimeout(() => {
		foo()
		bar()
		document.body.innerHTML += 'App running.'
	}, 100)
}).catch(e => {
	console.log(e)
	setTimeout(() => document.body.innerHTML = ('Error: ' + e.message), 100)
})
