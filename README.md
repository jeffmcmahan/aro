# Aro

## Introduction

Aro is a meta-runtime for node.js and a sub-regular transform for browser applications. It provides meta-programming tools, including solutions for type checking, design-by-contract, testing, and mocking.

```sh
sudo npm install aro -g
```

On the server, run your app with `aro` instead of Node.js proper:

```sh
aro run dev ./foo.js
```

To build for use in the browser, call the transform with `build`:

```sh
aro build dev ./foo.js ./build-tmp
```

In general, the syntax is:

```sh
aro [run|build] [dev|prod] ./file.js [--anyOtherArgs]
```

An appopriate shebang for an executable Aro program might be: `#!/usr/bin/env aro run prod`

N.b.: `process.env.ARO_ENV` will indicate `dev` or `prod`.

## Aro JavaScript

At the top of each file that will use Aro tools, add the `'use aro'` directive before any other material, including comments (only a BOM string is permitted). All of the meta-programming helpers are provided with valid javascript syntax:

```js
'use aro'

const foo = fn (bar => {                    // fn has superpowers

    param   (bar)(Number)                   // type check
    precon  (() => Number.isInteger(bar))   // precondition contract
    returns (Number)                        // type check
    postcon (rv => Number.isInteger(rv))    // postcondition contract

    return foo(bar)**2
})
```

### `fn` Functions

Functions defined with `fn` are special in that they are tracked by Aro, so that their input and output types can be checked, and contracts enforced. This works for both synchronous and `async` functions.

The `fn`-internal tools are:

* `param` checks a parameter's type.
* `returns` checks the parent function's return type.
* `precon` enforces a precondition.
* `postcon` enforces a postcondition.

In `prod` mode, these values are all stripped out of the code, eliminating any performance overhead:

```js
'use strict'

const foo = /*fn*/ (bar => {

    // param   (bar)(Number)
    // precon  (() => Number.isInteger(bar))
    // returns (Number)
    // postcon (rv => Number.isInteger(rv))

    return foo(bar)**2
})
```

### The `main` Function

The `main` variable is used to define the main app function, and is implicitly executed by Aro once all tests have run. So in the case below, a set of tests would run (more on that later), and then an HTTP server would spin up to handle requests on port 3000:

```js
'use aro'

const http = require('http')

main = fn (() => {

    // Create a fizzbuzz server to demo the idea of a main function.

    http.createServer((req, res) => {
        if (req.url === '/fizz') {
            res.end('buzz')
        } else {
            res.statusCode = 404
            res.end('')
        }
    }).listen(3000)
})
```

If defining a module that will be included and run by other code, ignore `main` and use the usual `module` and `exports` machinery.

### Testing with `test`, `mock`, & `local`

Tests are declared in sibling files using the `*.test.js` naming convention. Each test file is provided with the `module`, `exports`, and `local` variables from the source file that it is testing (values that are not exported can be accessed in tests via `local`). Here is an example file saved as ./foo.js, for which tests will be specified in ./foo.test.js (shown below):

./foo.js:
```js
'use aro'

local.insertSpaces = fn (inputStr => {

    // Inserts spaces before sequences of capital letters.

    param   (inputStr)(String)
    returns (String)

    return inputStr.replace(/([A-Z]+)/g, ' $1')
})

exports.fromCamelCase = fn (inputStr => {

    // Transforms a string from camel case to spaced lowercase case.

    param   (inputStr)(String)
    returns (String)

    if (!inputStr.trim()) {
        return inputStr
    }

    return local.insertSpaces(inputStr).toLowerCase()
})
```

./foo.test.js:

```js
'use aro'

test(done => {

    // Verify the space insertion function behavior.

    const testInput = 'fooBarBaz'
    const withSpaces = local.insertSpaces(testInput)
    assert.equal(withSpaces, 'foo Bar Baz')
    done()
})

test(done => {

    // Verify overall fromCamelCase transformation.

    const testInput = 'fooBarBaz'
    const regularCase = exports.fromCamelCase(testInput)
    assert.equal(regularCase, 'foo bar baz')
    done()
})
```

#### Mocking Functions

The `mock` function is the most valuable tool provided by Aro. It renders the ordinarily harrowing task of setting up mocks as simple as one function call. Any function that has been defined with `fn` can be mocked inline, as shown below:

Example ./bar.js:
```js
'use aro'

local.randomHex = fn (ln => {

    // Generate a random hex string.

    returns (String)

    return parseInt(Math.random().slice(2)).toString('hex').slice(0, ln)
})

exports.randomizeFname = fn (basename => {

    // Prepends a random hex string to the given basename.

    param   (basement)(String)
    returns (String)

    return local.randomHex(8) + '-' + basename
})
```

Because the `randomHex` function is random, it will be useful to mock its output in order to make the behavior of `randomizeFname` predictable and thus testable.

Example ./bar.test.js:
```js
'use aro'

test(done => {

    // Mock the randomHex function.
    mock(local.randomHex)(() => 'ff9a4113')

    // Call the function we're testing, which uses randomHex.
    const fname = exports.randomizeFname('foo.jpg')

    assert.equal(fname, 'ff9a4113-foo.jpg')

    done()
})
```

### Code Contracts

Contracts are enforced (dev mode only) by the `precon` and `postcon` functions, which take functions that perform verification work before or after the business logic runs. For example:

```js
'use aro'

const fs = require('fs')

const read = fn (async conf => {

    precon  (() => conf.file || conf.dir)     // Require .file or .dir prop...
    precon  (() => !(conf.file && conf.dir))  // ...but forbid both at same time.
    postcon (rv => rv.trim().length > 0)      // Don't return empty string.

    let data
    if (conf.file) {
        data = await fs.readFile(conf.file, conf.dataType).catch(() => '')
    } else {
        data = await fs.readdirSync(conf.dir).catch(() => '')
        data = data.join(', ')
    }
    return data
})
```

### Type Checking

Aro relies on the [Protocheck](https://github.com/jeffmcmahan/protocheck) library, and Aro's API directly exposes the composable higher-order types implemented by Protocheck as `global.types`. Type checks are implictly run on the inputs to the `param` and `returns` functions, as shown:

```js
'use aro'

const main = fn (bar => {

    param   (bar)(Number)
    returns (Number)

    return foo(bar)**2
})
```

#### Simple Types

Protocheck implements simple types with semantics that keep to the type definitions in the ES6 spec, with two exceptions: arrays and functions are not considered `Object` instances. The simple types are:

* Any `class` or constructor function (`String`, `Date`, `YourClass`, etc.).
* `Object` is any non-primitive except functions, arrays, and null-proto objects. 
* `Any` is anything (including `undefined`).
* `Null` is the type of `null` (per the ES6 spec).
* `Undefined` is the type of `undefined` (per the ES6 spec).
* `Void` is a value of type `Null` or `Undefined`.
* `Dictionary` is a null-prototype object (*i.e.,* `Object.create(null)`).

#### Union Types

To declare a union type, pass a list of types to `U`.

```js
U(String, Number)
```

This could be used as a parameter type check, for example, as shown:

```js
'use aro'

exports.convertIdToInt = fn (id => {

    param   (id)(U(String, Number))
    returns (Number)

    return parseInt(id, 10)
})
```

#### Maybe Types

Maybe constructs a union type that implicitly includes `Void`.

```js
Maybe(String)

// The above is exactly the same as the below:

U(String, Void)
```

#### Tuple Types

To declare a tuple, pass a list of types to `Tuple`.

```js
Tuple(String, Number, Boolean)
```

#### Generic Types

To declare a generic type, use the `T` function and pass it a value:

```js
exports.fooFunc = fn (obj => {

    param   (obj)(Object)
    returns (T(obj)) // Returns an object of the same type as obj.

    return new obj.constructor()
})
```

#### Array Types

To declare an array generic, use the `ArrayT` function and pass it a type. Here's a number array:

```js
ArrayT(Number)
```

#### Reusing Types

Any type can be saved and reused:

```js
'use aro'

const Coordinate = Tuple(Number, Number)

const distance = fn ((a, b)) => {

    // Get the distance between points a and b.

    param   (a)(Coordinate)
    param   (b)(Coordinate)
    returns (Number)

    const [x1, y1] = a
    const [x2, y2] = b

    return Math.sqrt(
        (x2 - x1)**2 + (y2 - y1)**2
    )
})
```

#### Return Types in Async Functions

Within `async` functions, Aro will respect the use of the `return` keyword, so that `returns (String)` would check the *resolved* value rather than the returned value (which would be a `Promise` object).

```js
'use aro'

const asyncIdentity = fn (async x => {

    param   (x)(Number)
    returns (Number)

    return x
})

asyncIdentity(5) // pass
```

## ESLint Config

```js
{
    // Let ESLint know about the globals and locally given variables.
    "globals": {
        "main": true,
        "fn": true,
        "param": true,
        "returns": true,
        "precon": true,
        "postcon": true,
        "local": true
    },

     // Treat .test.js files specially.
    "overrides": {
        "files": ["*.test.js"],
        "globals": {
            "test": true,
            "mock": true,
            "local": true
        }
    }
}
```