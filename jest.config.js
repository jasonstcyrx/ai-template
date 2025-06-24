module.exports = {
  // Use the test configuration from tests directory
  ...require('./tests/jest.config.js'),
  
  // Override root directory for VS Code
  rootDir: '.',
  
  // Ensure VS Code can find test files
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.js',
    '<rootDir>/tests/e2e/**/*.test.js'
  ],
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Global setup and teardown
  globalSetup: '<rootDir>/tests/globalSetup.js',
  globalTeardown: '<rootDir>/tests/globalTeardown.js',
  
  // Coverage paths relative to root
  collectCoverageFrom: [
    '<rootDir>/scripts/**/*.js',
    '!<rootDir>/scripts/show-work-script.js',
    '!<rootDir>/node_modules/**',
    '!<rootDir>/test-*/**'
  ],
  
  // Coverage output
  coverageDirectory: '<rootDir>/test-results/coverage',
  
  // Test result processor
  testResultsProcessor: '<rootDir>/tests/testResultsProcessor.js'
}; 