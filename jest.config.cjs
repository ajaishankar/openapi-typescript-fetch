module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  modulePathIgnorePatterns: ['dist'],
  globals: {
    'ts-jest': {
      tsconfig: {
        sourceMap: true,
      },
    },
  },
}
