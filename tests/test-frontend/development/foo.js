const local = global.aro['/foo.js']

import {exclaim} from './bar/index.js'

export default () => {
	return exclaim('Ahoy')
}