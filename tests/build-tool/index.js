'use strict'

const sh = require('child_process').exec
const buildScript = require('./app/build')

// Verify that the app and tests work.
sh(`open ${__dirname}/index.html`)
