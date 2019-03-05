'use strict'

const assert = require('assert')
const {fn} = require('../../index')

const falsy = fn (() => {
	return false
})

assert.equal(falsy(), false) // Duh

// Mock it as truthy.
falsy.mock(() => true)

// Get the truthy response.
assert.equal(falsy(), true)
