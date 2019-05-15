'use strict'

const fs = require('fs').promises
const http = require('http')
const sh = cmd => require('child_process').execSync(cmd).toString()

sh(`aro build production test-frontend`)

const page = (/*html*/`
	<!doctype html>
	<html>
	<head>
		<title>Production App Test</title>
		<script type="module" src="index.js"></script>
	</head>
	<body>
		<h1>Ahoy</h1>
	</body>
	</html>
`)

http.createServer(async (req, res) => {
	if (req.url === '/') {
		res.end(page)
	} else {
		const fname = __dirname + '/test-frontend/production' + req.url
		const jsFile = await fs.readFile(fname, 'utf8').catch(console.log)
		if (!jsFile) {
			res.statusCode = 404
			res.end('Not Found')
		} else {
			res.setHeader('Content-Type', 'text/javascript')
			res.end(jsFile)
		}
	}
}).listen(3874)

sh(`open http://localhost:3874`)