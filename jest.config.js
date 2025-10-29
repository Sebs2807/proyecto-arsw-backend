module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/main.ts',          
    '!**/test/**',            
    '!**/app/common/**',            

  ],
  testEnvironment: 'node',

  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
};
