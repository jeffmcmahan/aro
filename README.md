# Arrow Passing Style

## Introduction

Arrow passing style is a way of programming in ES6 based on the idea that we can produce more reliable programs if we can easily document and describe behavior, check types, handle errors, and both declare and execute tests *in situ.* Some utilities for this are provided by the `aro` package:

```sh
npm install aro
```

### Example

```js
// get-customer-name.js

import {fn, desc, param, error, assert} from 'aro'

export default fn (customer => {

    desc    ('Construct a serviceable greeting name.')
    param   (customer)(Object)
    returns (String)
    error   (e => log({e, customer}))
    assert  (r => first || last || (r === fallback))

    const fallback = 'We don\'t know your name...'
    const {first, last} = customer
    return (([first, last]).filter(n => n).join(' ') || fallback)
})
```

Note the `error` and `assert` calls. The `error` call declares an error handler, which has access to the error and to the function's scope (here it logs the `customer`). The `assert` call declares a test which examines the return value of the function (`r`) and the values of the private `first` and `last` variables.

### How This Is Done

`fn` controls the creation of functions, and is therefore privvy to subsequent invocations of those functions, and can thus construct and watch the live call stack. This makes it possible to bind in situ tests and error handling logic to the function.

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
