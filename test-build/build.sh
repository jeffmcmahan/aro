aro build dev app dist
browserify dist > dist.bundle.js
cat dist/aro-tools.js dist.bundle.js > app.js
