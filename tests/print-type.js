'use strict'

const assert = require('assert')
const printType = require('../utils/print-type')

// Numbers
assert(printType(1) === 'Number')
assert(printType(NaN) === 'Number')
assert(printType(Infinity) === 'Number')
assert(printType(new Number()) === 'Number')

// Other Primitives
assert(printType('') === 'String')
assert(printType(true) === 'Boolean')
assert(printType(()=>{}) === 'Function')

// Composite Types
assert(printType([]) === 'Array')
assert(printType({}) === 'Object')
assert(printType(new Date()) === 'Date')

// Custom Class
class AltNumber extends Number {}
assert(printType(new AltNumber()) === 'AltNumber')
