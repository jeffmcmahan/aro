'use strict'

const fs = require('fs')
const assert = require('assert').strict
const sh = cmd => require('child_process').execSync(cmd).toString()

const jsonFile = __dirname + '/test-backend/production/results.json'

// Run our test-app in dev mode.
const output = sh('aro run production ./test-backend --prod-arg')

// Examine stdout.
assert(!output.includes('tested: test'))
assert(!output.includes('Ran 1 tests.'))

// Examine results.json.
const results = JSON.parse(fs.readFileSync(jsonFile))
assert.equal(results.length, 6)
assert(results.includes('tested: param'))
assert(results.includes('tested: precon'))
assert(results.includes('tested: returns'))
assert(results.includes('tested: postcon'))
assert(results.includes('tested: main'))
assert(results.includes('tested: nesting'))

console.log('(2) aro run prod tests complete')
