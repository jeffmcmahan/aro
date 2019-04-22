(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict'

const {callStack, tests, mocks} = require('./state')
const isAsync = require('./utils/is-async')

const syncCall = (call, ...args) => {

	// Runs a synchronous function, then checks its return type 
	// and its postconditions.

	const returned = call.fn(...args)
	if (call.type) {
		(call.type(returned))
	}
	if (call.post.length) {
		call.post.forEach(cond => cond(returned))
	}
	return returned
}

const asyncCall = (call, ...args) => {

	// Runs an asynchronous function, then checks its return/resolve
	// type and its postconditions.

	return new Promise((resolve, reject) => {
		call.fn(...args).then(resolved => {
			callStack.push(call)
			if (call.type) {
				(call.type(resolved))
			}
			if (call.post.length) {
				call.post.forEach(postCond => postCond(resolved))
			}
			resolve(resolved)
			callStack.pop()
		}).catch(err => {
			callStack.push(call)
			reject(err)
			callStack.pop()
		})
	})
}

module.exports = (function __fn__ (f) {

	// Note whether it uses the "async" keyword.
	const _isAsync = isAsync(f)

	// Record a mock function, to be used if present.
	mocks.set(f, null)

	// Return the wrapper function that gets called.
	const indirectFunc = ((...args) => {
		const call = {
			args,
			fn: (mocks.get(f) || f),
			pre: 0,
			post: []
		}
		callStack.push(call) // Add the invocation to the call stack.

		// Execute the function and save the result.
		const result = _isAsync
			? asyncCall(call, ...args) 
			: syncCall(call, ...args)
		
		callStack.pop() // Remove from the call stack.
		return result
	}).bind(void 0)

	// Define the testing API.
	indirectFunc.mock = mock => mocks.set(f, mock)
	indirectFunc.test = test => tests.push(test)

	return indirectFunc
})

},{"./state":10,"./utils/is-async":15}],2:[function(require,module,exports){
'use strict'

const fs = require('fs')
const state = require('./state')

if (state.mode === 'on') {
	((require || {}).extensions || {})['.js'] = (module, fname) => {
		let content = fs.readFileSync(fname, 'utf8')
		const isProjectFile = !fname.includes('/node_modules/')
		if (isProjectFile) {
			try {
				const tests = fs.readFileSync(fname.slice(0,-3) + '.test.js', 'utf8')
				content += tests ? `;(() => {${tests}})();` : ''
			} catch (e) {
				// No tests defined.
			}
		}
		module._compile(content, fname)
	}
}

},{"./state":10,"fs":16}],3:[function(require,module,exports){
'use strict'

const typeCheck = require('protocheck')
const state = require('./state')
const error = require('./utils/error')
const noop = () => void 0
const api = {}

// Development/Debug Mode
if (state.mode === 'on') {

	api.fn = require('./__fn__')

	api.param = val => __Type => {
		if (typeCheck(val, __Type)) {
			return noop
		}
		const {valueTypeName, expectedTypeName} = typeCheck.failureDetail(val, __Type)
		throw new TypeError(
			error.paramType(expectedTypeName, valueTypeName, new Error())
		)
	}

	api.precon = f => {
		const call = state.callStack.slice(-1)[0]
		call.pre++
		try {
			if (!f()) {
				throw new Error(error.precondition(call.pre, new Error()))
			}
		} catch (e) {
			throw new Error(error.precondition(call.pre, e))
		}
	}

	api.postcon = f => {
		const call = state.callStack.slice(-1)[0]
		const conditionCheck = returnVal => {
			if (!f(returnVal)) {
				throw new Error(
					`Post-condition ${f.toString()} failed in: fn (${call.fn.toString()})`
				)
			}
		}
		state.callStack.slice(-1)[0].post.push(conditionCheck)
	}

	api.returns = __Type => {
		state.callStack.slice(-1)[0].type = val => {
			if (!typeCheck(val, __Type)) {
				const {valueTypeName, expectedTypeName} = typeCheck.failureDetail(val, __Type)
				throw new TypeError(
					error.returnType(expectedTypeName, valueTypeName, new Error())
				)
			}
		}
		return noop
	}

	api.runTests = () => new Promise(resolve => {
		let count = state.tests.length
		const nextTest = () => {
			state.mocks.clear()
			if (state.tests.length) {
				state.tests.shift()(nextTest)
			} else {
				console.log(`Ran ${count} tests.`)
				resolve()
			}
		}
		setTimeout(nextTest, 1)
	})

	api.types = typeCheck.types
	Object.keys(api.types).forEach(key => api[key] = api.types[key])
}

// Production Mode
if (state.mode === 'off') {
	api.fn = f => {
		f.test = () => f
		f.mock = () => f
		return f
	}
	api.runTests = () => Promise.resolve()
	api.precon 	= noop
	api.postcon = noop
	api.param 	= () => noop
	api.returns = noop
	api.types	= {}
	Object.keys(typeCheck.types).forEach(key => (
		api[key] = api.types[key] = noop
	))
}

// If running node, enable tests and expose the build tool.
if (state.engine() === 'node') {
	require('./enable-tests')
}

Object.freeze(api.types)
module.exports = Object.freeze(api)

},{"./__fn__":1,"./enable-tests":2,"./state":10,"./utils/error":14,"protocheck":6}],4:[function(require,module,exports){
'use strict'

const typeCheck = require('./typeCheck')

module.exports = (value, expectedType) => {
	if (typeCheck(value, expectedType)) {
		return null
	}

	const expectedTypeName = expectedType.hmac 
		? expectedType.__desc 
		: expectedType.name
	
	const valueTypeName = '' + (
			value == null ? value
		: 	value.constructor ? value.constructor.name
		:	'Dictionary'
	)

	return {expectedTypeName, valueTypeName}
}

},{"./typeCheck":8}],5:[function(require,module,exports){
'use strict'

module.exports = Math.random()

},{}],6:[function(require,module,exports){
'use strict'

const typeCheck = require('./typeCheck')

// Expose the types and type-creation functions.
typeCheck.types = require('./types')

// Provide the ability to get information about typecheck failures.
typeCheck.failureDetail = require('./failureDetail')

module.exports = typeCheck

},{"./failureDetail":4,"./typeCheck":8,"./types":9}],7:[function(require,module,exports){
'use strict'

const objProto = Object.prototype

const getProto = v => (v == null)
	? v
	: (Object.getPrototypeOf || (v => v.__proto__))(v)

// These are the types that we will not treat as Objects, following the intention 
// expressed in the ES6 spec at sec. 4.3.2, describing primitives as: "member of 
// one of the types... Boolean, Number, Symbol, or String," and then add Function
// and Array, in keeping with reasonable mainstream expectations.
const nonObjects = [
	Boolean,
	Symbol,
	String,
	Number,
	Array,
	Function
].map(v => v.prototype)

module.exports = (proto, v) => {
	let ignoreObj
	let vProto = getProto(v)
	while (vProto) {
		if (nonObjects.includes(vProto)) {
			ignoreObj = true
		}
		if (vProto === proto) {
			return (ignoreObj && proto === objProto) 
				? !!getProto(vProto)
				: true
		}
		vProto = getProto(vProto)
	}
	return false
}
},{}],8:[function(require,module,exports){
'use strict'

const hmac = require('./hmac')
const protoCheck = require('./protoCheck')

// Wrapper facade to expose the prototypes
module.exports = (v, Type) => {
	
	if (Type && Type.hmac === hmac) {
		return Type(v)
	}

	if (v == null && v !== Type) {
		return false
	}

	return protoCheck(Type.prototype, v)
}
},{"./hmac":5,"./protoCheck":7}],9:[function(require,module,exports){
'use strict'

const protoCheck = require('./protoCheck')
const typeCheck = require('./typeCheck')
const hmac = require('./hmac')

// Reconstruct type check name, like "Maybe(String)"
const typeNames = types => (
	types.map(type => type.hmac ? type.__desc : type.name).join(', ')
)

const valueType = value => (
		value == null ? value
	: 	value.constructor ? value.constructor.name
	:	value.constructor
)

// Any type just allows everything.
const Any = () => true
Any.__desc = 'Any'
Any.hmac = hmac

// Undeinfed type for undefined value only.
const Undefined = v => v === (void 0)
Undefined.__desc = 'Undefined'
Undefined.hmac = hmac

// Null type for null value only.
const Null = v => v === null
Null.__desc = 'Null'
Null.hmac = hmac

// Dictionaries, i.e.: Object.create(null)
const Dictionary = v => v && (v.__proto__ === void 0)
Dictionary.__desc = 'Dictionary'
Dictionary.hmac = hmac

// Unions work if any of the types given is satisfied.
const U = (...types) => {
	const test = v => types.some(t => typeCheck(v, t))
	test.hmac = hmac
	test.__desc = 'U(' + typeNames(types) + ')'
	return test
}

// Maybe is a Union with Void added to the list.
const Maybe = (...types) => {
	const test = U(...types, Void)
	test.__desc = 'Maybe(' + typeNames(types) + ')'
	return test
}

// Void is Union of null and undefined.
const Void = U(Null, Undefined)
Void.__desc = 'Void'

// Tuples are array of a given length with items of given types.
const Tuple = (...types) => {
	const test = v => (
		typeCheck(v, Array) &&
		types.length === v.length &&
		types.every((type, i) => typeCheck(v[i], type))
	)
	test.__desc = 'Tuple(' + typeNames(types) + ')'
	test.hmac = hmac
	return test
}

// T is a generic type (takes the type of a value) to check a value.
const T = v1 => {
	let proto = (v1 == null) ? v1 : v1.__proto__
	const test = v2 => ((v1 == null && v1 === v2) || protoCheck(proto, v2))
	test.__desc = 'T(' + valueType(v1)  + ')'
	test.hmac = hmac
	return test
}

// ArrayT is an array generic type (string array is Array(String).
const ArrayT = type => {
	const test = arr => (
		typeCheck(arr, Array) && 
		arr.every(val => typeCheck(val, type))
	)
	test.__desc = 'ArrayT(' + typeNames([type])  + ')'
	test.hmac = hmac
	return test
}

module.exports = {
	Any, Undefined, Null, Void, Dictionary, Maybe, Tuple, U, T, ArrayT
}

},{"./hmac":5,"./protoCheck":7,"./typeCheck":8}],10:[function(require,module,exports){
(function (process){
'use strict'

module.exports = (() => {

	// A simple container for mutable state information.

	const Public = {
		mode: 'off',
		mocks: new Map,
		callStack: [],
		tests: []
	}

	Public.engine = () => {
		return ((typeof process === 'undefined') || !process.release)
			? 'browser'
			: 'node'
	}

	Public.mode = (() => {

		// Determines whether the tool should be on or off, depending on
		// the environment and some flags/variables/etc.

		if (Public.engine() === 'browser') {
			return window['--development'] ? 'on' : 'off'
		} else {
			const nodeInspect = process.execArgv.some(arg => arg.includes('--inspect-brk='))
			const nodeEnv = process.env.NODE_ENV === 'development'
			const devFlag = process.argv.includes('--development')
			return (nodeInspect || nodeEnv || devFlag) ? 'on' : 'off'
		}
	})()

	return Object.freeze(Public)
})()

}).call(this,require('_process'))
},{"_process":17}],11:[function(require,module,exports){
'use strict'

const {fn} = require('../../../index.js')

module.exports = fn (() => {})

},{"../../../index.js":3}],12:[function(require,module,exports){
'use strict'

module.exports = () => {}
},{}],13:[function(require,module,exports){
'use strict'

const protocheck = require('protocheck') // Test third party includes.
const {runTests} = require('../../../index.js')
const foo = require('./foo')
const bar = require('./nested/bar')

runTests().then(() => {
	setTimeout(() => {
		foo()
		bar()
		document.body.innerHTML += 'App running.'
	}, 100)
}).catch(e => {
	console.log(e)
	setTimeout(() => document.body.innerHTML = ('Error: ' + e.message), 100)
})

},{"../../../index.js":3,"./foo":11,"./nested/bar":12,"protocheck":6}],14:[function(require,module,exports){
'use strict'

const {callStack} = require('../state')
const massNouns = ['void', 'null', 'undefined']
const vowels = 'aeiou'

const capitalize = str => str.slice(0,1).toUpperCase() + str.slice(1)

// Prepends "a", "an", or nothing to a noun, as appropriate.
const addArticle = (noun, caps = false) => {
	const _noun = ('' + noun).toLowerCase().replace(/[^a-z]/g, '')
	if (massNouns.includes(_noun)) {
		return noun
	}
	const detPhrase = vowels.includes(_noun[0]) ? `an ${noun}` : `a ${noun}`
	return caps ? capitalize(detPhrase) : detPhrase
}

// Reconstructs the function's source string.
const fn = () => {
	let src = callStack.slice(-1)[0].fn.toString()
	if (!src.includes('\n')) {
		return '\t' + src.trim()
	} else {
		src = src.replace(/[ ]{2}/g, '\t')
		const lines = src.split('\n')
		const tabDepth = lines.slice(-1)[0].replace(/^(\t+)/, '$1').length
		const remove = ''.padStart((tabDepth - 1), '\t')
		lines.forEach((line, i) => {
			lines[i] = line.replace(remove, '')
		})
		src = '\tfn (' + lines.join('\n\t') + ')'
		return src
	}
}

// Filters irrelevant lines from the stack trace.
const filterStack = stack => {
	const lines = stack.split('\n')
	return lines
		.filter(ln => !ln.includes('api.precon'))
		.filter(ln => !ln.includes('__Type'))						// param()
		.filter(ln => !ln.includes('callStack.slice.type.val')) 	// returns()
		.filter(ln => !ln.includes('__fn__'))						// main
		.filter(ln => !ln.includes('(internal/'))					// irrelevant
		.join('\n') + ('\n\n    Original Stack:\n')
}

exports.precondition = (number, err) => {
	return (
		`Precondition no. ${number} failed in:\n\n` +
		fn() + '\n\n' +
		filterStack(err.stack || err.message)
	)
}

exports.returnType = (expected, actual, err) => {
	return (
		`Function of type ${expected} returned ${addArticle(actual)}.\n\n` +
		fn() + '\n\n' +
		filterStack(err.stack || err.message)
	)
}

exports.paramType = (expected, actual, err) => {
	return (
		`${addArticle(expected, true)} parameter was of type ${actual}.\n\n` +
		fn() + '\n\n' +
		filterStack(err.stack || err.message)
	)
}
},{"../state":10}],15:[function(require,module,exports){
'use strict'

module.exports = fn => /^async[\s\(]/.test(fn.toString().trim())

},{}],16:[function(require,module,exports){

},{}],17:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[13]);
