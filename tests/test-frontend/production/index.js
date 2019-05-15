const local = global.aro['/index.js']; let main = () => {}; import './aro-tools.js'

import foo from './foo.js'

document.querySelector('h1').innerHTML = foo()

global.aro.main = main
global.aro.main()