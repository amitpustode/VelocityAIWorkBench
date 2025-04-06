import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    root: __dirname,
    // include: ['test/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    include: ['**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    testTimeout: 1000 * 29,
    coverage: {
      provider: 'v8', // or 'c8'
      reporter: ['text', 'lcov'], // lcov is required for SonarQube
      reportsDirectory: './coverage',
    },
  },
})
