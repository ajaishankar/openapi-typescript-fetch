module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  modulePathIgnorePatterns: ['dist'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
}
