# Aro
## Introduction
Aro is a library that allows the creation of arrow functions that contain enforceable parameter type checks, return type checks, preconditions, and postconditions (using plain ES2017). The type checks and contracts are enforced only when in development mode.

```sh
npm install aro
```

## Example

```js
import {fn, param, returns, precon, postcon} from 'aro'

// Construct a serviceable greeting name.
export default fn (customer => {

    param   (customer)(Object)
    returns (String)
    postcon (r => (first || last) || (r === fallback))

    const fallback = 'We don\'t know your name...'
    const {first, last} = customer
    return (([first, last]).filter(n => n).join(' ') || fallback)
})
```

During development, if any constraint fails, an error is thrown, with a message of the form:

```
TypeError: Function of type String returned a Number:

    fn (customer => {

        param   (customer)(Object)
        returns (String)
        postcon (r => (first || last) || (r === fallback))

        const fallback = 'We don\'t know your name...'
        const {first, last} = customer
        return (([first, last]).filter(n => n).join(' ') || fallback)
    })

    at anonymous (.../foo/bar/baz/get-customer-name.js:6:2)
    at Object.<anonymous> (.../foo/bar/baz.js:32:1)
    ...
```

## Development Mode

There are 4 ways to tell Aro to enforce type checks and contracts:

1. Run node in debug mode:
    ```
    node inspect ./my-project
    ```
2. Set `NODE_ENV` to `development`:
    ```
    NODE_ENV=development node ./my-project
    ```
3. Pass a `--development` flag when you start node:
    ```
    node ./my-project --development
    ```
4. Set `window['--development']` to `true` before the importing Aro (browser only).

## Production Mode

Production mode disables all Aro functionality, replacing everything with the lightest possible stand-in, so that your code runs as fast as possible, without having to transpile the Aro functions out of it.

In production mode, `fn` becomes the identity function, and the `param`, `returns`, `precon`, and `postcon` functions become no-ops. In modern JS engines, no-op invocations will either be removed from the call stack entirely by speculative optimization, or will execute at &approx; >1.5 &times; 10<sup>9</sup> ops/sec (*i.e.,* there is no observable performance impact while in production mode, in either case).

## Type Declarations

Aro relies on the [Protocheck](https://github.com/jeffmcmahan/protocheck) library for all type checking functionality, and Aro's API directly exposes the composable higher-order types implemented by Protocheck, as well (read further).

### Simple Types

Protocheck implements simple types with semantics that keep to the type definitions in the ES6 spec, with two exceptions: arrays and functions are not considered `Object` instances. The simple types are:

* Any `class` or constructor function (`String`, `Date`, `YourClass`, etc.).
* `Object` is any non-primitive except functions, arrays, and null-proto objects. 
* `Any` is anything (including `undefined`).
* `Null` is the type of `null` (per the ES6 spec).
* `Undefined` is the type of `undefined` (per the ES6 spec).
* `Void` is a value of type `Null` or `Undefined`.
* `Dictionary` is a null-prototype object (*i.e.,* `Object.create(null)`).

### Union Types

To declare a union type, pass a list of types to `U`.

```js
U(String, Number)
```

This could be used as a parameter type check, for example, as shown:

```js
exports.convertIdToInt = fn (id => {

    param   (id)(U(String, Number))
    returns (Number)
    postcon (r => Number.isInteger(r))

    return parseInt(id, 10)
})
```

### Maybe Types

Maybe constructs a union type that implicitly includes `Void`.

```js
Maybe(String)

// The above is exactly the same as the below:

U(String, Void)
```

### Tuple Types

To declare a tuple, pass a list of types to `Tuple`.

```js
Tuple(String, Number, Boolean)
```

### Generic Types

To declare a generic type, use the `T` function and pass it a value:

```js
exports.fooFunc = fn (obj => {

    param   (obj)(Object)
    returns (T(obj)) // Returns an object of the same type as obj.

    return new obj.constructor()
})
```

### Array Types

To declare an array generic, use the `ArrayT` function and pass it a type. Here's a number array:

```js
ArrayT(Number)
```

### Reusing Types

Any type can be saved and reused:

```js
const Coordinate = Tuple(Number, Number)

// Get the distance between points a and b.
const distance = fn ((a, b)) => {

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

## Return Types in Async Functions

Within `async` functions, Aro will respect the use of the `return` keyword, so that `returns (String)` would check the *resolved* value rather than the returned value (which would be a `Promise` object).

```js
exports.asyncIdentity = fn (async (x) => {

    param   (x)(Number)
    returns (Number)

    return x
})

asyncIdentity(5) // pass
```
