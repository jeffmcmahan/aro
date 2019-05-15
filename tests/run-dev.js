'use strict'

const fs = require('fs')
const assert = require('assert').strict
const sh = cmd => require('child_process').execSync(cmd).toString()

// Clear JSON data.
const jsonFile = __dirname + '/test-backend/development/results.json'

// Run our test-app in dev mode.
const output = sh('aro run development ./test-backend --dev-arg')

// Examine stdout.
assert(output.includes('tested: test'))
assert(output.includes('Ran 4 tests.'))

// Examine results.json.
const results = JSON.parse(fs.readFileSync(jsonFile))

assert.equal(results.length, 6)
assert(results.includes('tested: param'))
assert(results.includes('tested: precon'))
assert(results.includes('tested: returns'))
assert(results.includes('tested: postcon'))
assert(results.includes('tested: main'))
assert(results.includes('tested: nesting'))

console.log('(1) aro run dev tests complete')