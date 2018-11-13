'use strict'

const {success, fail} = require('./utils')
const {fn, Void} = require('..')

success(fn (Void) (() => {}))

// Void with a return value should fail.
fail(fn (Void) (() => ''), 'Function of type Void returned a String.')
