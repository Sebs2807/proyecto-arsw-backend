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
    '^openai$': '<rootDir>/test/mock-openai.js',
    "livekit-server-sdk": "<rootDir>/test/mock-livekit.js",
  },

  setupFilesAfterEnv: ['<rootDir>/test/jest.setup.ts'],
};
