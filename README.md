# Aro

## Introduction

Arrow passing style is (my term for) a way of programming in ES6 based on the idea that we can produce more reliable programs if we document behavior, check types, handle errors, and test *in situ.* Some utilities for this are provided by the `aro` package:

```sh
npm install aro
```

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
TypeError: Function of type String returned Void:

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

### Testing

```js
import {fn, desc, assert} from 'aro'

export default fn (customer => {

    desc    ('Construct a serviceable greeting name.')
    assert  (r => first || last || (r === fallback))

    const fallback = 'We don\'t know your name...'
    const {first, last} = customer
    return (([first, last]).filter(n => n).join(' ') || fallback)
})
```

The `assert` call declares a test which examines the return value of the function (`r`) and the values of the private `first`, `last`, and `fallback` variables.

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
* `Any` is anything (including nothing).
* `Null` (regarded for sanity's sake as the type of `null`)
* `Void` (replaces `undefined`)
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
