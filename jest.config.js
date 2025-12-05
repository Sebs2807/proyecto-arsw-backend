module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testRegex: String.raw`.*\.spec\.ts$`,
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s', '!**/main.ts', '!**/test/**', '!**/app/common/**'],
  testEnvironment: 'node',

  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^src/app/(.*)$': '<rootDir>/src/app/$1',
  },

  setupFilesAfterEnv: ['<rootDir>/test/jest.setup.ts'],
};
