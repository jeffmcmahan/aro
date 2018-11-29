'use strict'

const assert = require('assert')
exports.fail = (f, msg) => assert.throws(f, e => e.message.includes(msg))
exports.success = f => assert.doesNotThrow(f)