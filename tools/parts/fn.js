export const fn = (() => {
	
	const isAsync = f => /^async[\s\(]/.test(f.toString().trim())

	return f => {

		// Note whether it uses the "async" keyword.
		const _isAsync = isAsync(f)

		// Return the wrapper function that gets called.
		const fn = ((...args) => {
			const call = {
				args,
				fn: (state.mocks.get(f) || f),
				pre: 0,
				post: []
			}
			state.callStack.push(call) // Add the invocation to the call stack.

			// Execute the function and save the result.
			// This is done inline to avoid bloating the stack trace.

			let result
			if (_isAsync) {
				result = new Promise((resolve, reject) => {
					call.fn(...args).then(resolved => {
						state.callStack.push(call)
						if (call.type) {
							(call.type(resolved))
						}
						if (call.post.length) {
							call.post.forEach(postCond => postCond(resolved))
						}
						resolve(resolved)
						state.callStack.pop()
					}).catch(err => {
						state.callStack.push(call)
						reject(err)
						state.callStack.pop()
					})
				})
			} else {
				result = call.fn(...args)
				if (call.returns) {
					(call.returns(result))
				}
				if (call.post.length) {
					call.post.forEach(cond => cond(result))
				}
			}
			
			state.callStack.pop() // Remove from the call stack.
			return result
		})

		// Keep a reference to the inner func to look up mocks.
		fn.__inner__ = f

		return fn
	}
})()