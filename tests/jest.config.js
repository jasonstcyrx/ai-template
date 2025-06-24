module.exports = {
  // Test environment configuration
  testEnvironment: 'node',
  
  // Root directory for tests
  roots: ['<rootDir>'],
  
  // Test file patterns
  testMatch: [
    '<rootDir>/unit/**/*.test.js',
    '<rootDir>/e2e/**/*.test.js'
  ],
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/setup.js'],
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: '<rootDir>/../test-results/coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    '<rootDir>/../scripts/**/*.js',
    '!<rootDir>/../scripts/show-work-script.js', // Exclude demo script
    '!<rootDir>/../node_modules/**',
    '!<rootDir>/../test-*/**' // Exclude test directories
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // Test timeout
  testTimeout: 30000,
  
  // Verbose output
  verbose: true,
  
  // Module paths
  moduleFileExtensions: ['js', 'json'],
  
  // Transform configuration
  transform: {},
  
  // Setup and teardown
  globalSetup: '<rootDir>/globalSetup.js',
  globalTeardown: '<rootDir>/globalTeardown.js',
  
  // Test result processors
  testResultsProcessor: '<rootDir>/testResultsProcessor.js',
  
  // Reporter configuration
  reporters: [
    'default',
    ['jest-html-reporters', {
      publicPath: '<rootDir>/../test-results/html',
      filename: 'test-report.html',
      expand: true
    }]
  ]
}; 