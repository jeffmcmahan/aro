export const defineTests = () => Promise.all([
import('./index.test.js'),
import('./nested/test-nesting.test.js')
])