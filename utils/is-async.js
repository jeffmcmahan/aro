'use strict'

module.exports = fn => /^async[\s\(]/.test(fn.toString().trim())
