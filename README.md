# Aro

## Introduction

Aro is a development tool which configures arrow functions so they can contain enforceable parameter type checks, return type checks, preconditions, and postconditions, entirely *in situ*. The type checks and contracts are enforced only during development/debugging.

```sh
npm install aro
```

There are several ways to run your code so that the type checks and contracts are enforced. First, you can tell node to execute your code in debug mode using `node inspect`:

```
node inspect ./my-project
```

Alternatively, set the `NODE_ENV` environment variable to `development`:

```
NODE_ENV="development" node ./my-project
```

Or simply pass `--development` as a flag when you start node:

```
node ./my-project --development
```

In the browser, set a global `--development` variable to `true` before your code include(s):

```html
<script>window['--development'] == true</script>
<script src="/my-project.bundle.js"></script>
```

This can also be done as part of a build process by prepending `window['--development'] == true;` to the bundle.

### Type Checking

Use JsDoc-like conventions to (optionally) declare and enforce function return types (`returns`) and parameter types (`param`), as shown here:

```js
// get-customer-name.js

import {fn, desc, param, returns} from 'aro'

export default fn (customer => {

    desc    ('Construct a serviceable greeting name.')
    param   (customer)(Object)
    returns (String)

    const fallback = 'We don\'t know your name...'
    const {first, last} = customer
    return (([first, last]).filter(n => n).join(' ') || fallback)
})
```

When a type check fails, an error is thrown, with a message of the form:

```
TypeError: Function of type String returned a Number:

    fn (customer => {

        desc    ('Construct a serviceable greeting name.')
        param   (customer)(Object)
        returns (String)

        const fallback = 'We don\'t know your name...'
        const {first, last} = customer
        return (([first, last]).filter(n => n).join(' ') || fallback)
    })

    at anonymous (.../foo/bar/baz/get-customer-name.js:7:2)
    at Object.<anonymous> (.../foo/bar/baz.js:32:1)
    ...
```

### Creating Contracts

```js
import {fn, desc, post} from 'aro'

export default fn (customer => {

    desc    ('Construct a serviceable greeting name.')
    pre     (() => customer.length > 0)
    post    (r => first || last || (r === fallback))

    const fallback = 'We don\'t know your name...'
    const {first, last} = customer
    return (([first, last]).filter(n => n).join(' ') || fallback)
})
```

The `pre` call amounts to an `assert` call, whereas the `post` call declares a test which examines the return value of the function (`r`).

### Handling Execptions

```js
import {fn, desc, error} from 'aro'

export default fn (customer => {

    desc    ('Construct a serviceable greeting name.')
    error   (e => log({e, first, last}))

    const fallback = 'We don\'t know your name...'
    const {first, last} = customer
    return (([first, last]).filter(n => n).join(' ') || fallback)
})
```

The `error` call declares an error handler, which has access to the error and to the function's scope (here it simply logs the error and the private `first` and `last` variables).

### How This Is Done

`fn` controls the creation of functions, and is therefore privy to subsequent invocations of those functions, and can thus construct and watch the live call stack. This makes it possible to bind in situ tests and error handling logic to the function.

## Type Declarations

### Simple Types

* Any `class` or constructor function (`String`, `Date`, `YourClass`, etc.).
* `Any` is anything (including `undefined`).
* `Null` (regarded for sanity's sake as the type of `null`)
* `Undefined`
* `Void` (`null` or `undefined`)
* `Dictionary` is an object with no prototype (*i.e.,* `Object.create(null)`).

### Union Types

To declare a union type, pass a list of types to `U`.

```js
U(String, Number)
```

### Maybe Types

Maybe types are a special case of union types (`Maybe` implicitly includes `Void` in the list of types).

```js
Maybe(String)
```

### Tuple Types

To declare a tuple, pass an array literal to `Tuple`.

```js
Tuple(String, Number, Boolean)
```

### Generic Types

To declare a generic type, use the `T` function and pass it a value:

```js
const fn (foo => {
    // Returns a value of the same type as foo.
    returns (T(foo))
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

const distance = fn ((a, b)) => {

    desc    ('Get the distance between points a and b.')
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
