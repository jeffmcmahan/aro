'use strict'

require('./any-type')
require('./void-type')
require('./built-in-type')
require('./maybe-types')
require('./union-types')
require('./tuple-types')
require('./nesting')
console.log('Typechecking tests completed.')

require('./contracts')

require('./define-test')
console.log('defineTest method tests completed.')

require('./stack')
console.log('Error stack tests completed.')

require('./async').then(console.log('Async tests completed.'))