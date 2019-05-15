'use strict'

require('./run-dev')
require('./run-prod')

require('./build-dev')
require('./build-prod')
setTimeout(() => process.exit, 3000) // 3s to open browser and serve files.
