const fs = require('fs');
const path = require('path');

module.exports = (results) => {
  // Process test results and generate summary
  const summary = {
    timestamp: new Date().toISOString(),
    totalTests: results.numTotalTests,
    passedTests: results.numPassedTests,
    failedTests: results.numFailedTests,
    skippedTests: results.numPendingTests,
    testSuites: results.numTotalTestSuites,
    passedTestSuites: results.numPassedTestSuites,
    failedTestSuites: results.numFailedTestSuites,
    coverage: results.coverageMap ? {
      lines: results.coverageMap.getCoverageSummary().lines.pct || 0,
      functions: results.coverageMap.getCoverageSummary().functions.pct || 0,
      branches: results.coverageMap.getCoverageSummary().branches.pct || 0,
      statements: results.coverageMap.getCoverageSummary().statements.pct || 0
    } : null,
    success: results.success
  };
  
  // Create detailed test results
  const testResults = {
    summary,
    testSuites: results.testResults.map(suite => ({
      name: suite.testFilePath.replace(process.cwd(), ''),
      status: suite.numFailingTests > 0 ? 'failed' : 'passed',
      duration: suite.perfStats.end - suite.perfStats.start,
      numTests: suite.numPassingTests + suite.numFailingTests + suite.numPendingTests,
      numPassed: suite.numPassingTests,
      numFailed: suite.numFailingTests,
      numSkipped: suite.numPendingTests,
      tests: suite.testResults.map(test => ({
        title: test.title,
        status: test.status,
        duration: test.duration,
        failureMessages: test.failureMessages
      }))
    }))
  };
  
  // Write results to file
  const resultsDir = path.join(__dirname, '../test-results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(resultsDir, 'test-results.json'),
    JSON.stringify(testResults, null, 2)
  );
  
  // Generate markdown report
  const markdownReport = generateMarkdownReport(testResults);
  fs.writeFileSync(
    path.join(resultsDir, 'test-report.md'),
    markdownReport
  );
  
  // Log summary to console
  console.log('\n📊 Test Results Summary:');
  console.log(`✅ Passed: ${summary.passedTests}/${summary.totalTests} tests`);
  console.log(`❌ Failed: ${summary.failedTests}/${summary.totalTests} tests`);
  console.log(`⏭️  Skipped: ${summary.skippedTests}/${summary.totalTests} tests`);
  
  if (summary.coverage) {
    console.log('\n📈 Coverage Summary:');
    console.log(`Lines: ${(summary.coverage.lines || 0).toFixed(1)}%`);
    console.log(`Functions: ${(summary.coverage.functions || 0).toFixed(1)}%`);
    console.log(`Branches: ${(summary.coverage.branches || 0).toFixed(1)}%`);
    console.log(`Statements: ${(summary.coverage.statements || 0).toFixed(1)}%`);
  }
  
  console.log(`\n📄 Detailed reports saved to: ${resultsDir}`);
  
  return results;
};

function generateMarkdownReport(testResults) {
  const { summary, testSuites } = testResults;
  
  let markdown = `# Test Results Report\n\n`;
  markdown += `**Generated:** ${summary.timestamp}\n\n`;
  
  // Summary section
  markdown += `## Summary\n\n`;
  markdown += `| Metric | Value |\n`;
  markdown += `|--------|-------|\n`;
  markdown += `| Total Tests | ${summary.totalTests} |\n`;
  markdown += `| Passed | ${summary.passedTests} |\n`;
  markdown += `| Failed | ${summary.failedTests} |\n`;
  markdown += `| Skipped | ${summary.skippedTests} |\n`;
  markdown += `| Test Suites | ${summary.testSuites} |\n`;
  markdown += `| Success Rate | ${((summary.passedTests / summary.totalTests) * 100).toFixed(1)}% |\n\n`;
  
  // Coverage section
  if (summary.coverage) {
    markdown += `## Coverage\n\n`;
    markdown += `| Type | Percentage |\n`;
    markdown += `|------|------------|\n`;
    markdown += `| Lines | ${(summary.coverage.lines || 0).toFixed(1)}% |\n`;
    markdown += `| Functions | ${(summary.coverage.functions || 0).toFixed(1)}% |\n`;
    markdown += `| Branches | ${(summary.coverage.branches || 0).toFixed(1)}% |\n`;
    markdown += `| Statements | ${(summary.coverage.statements || 0).toFixed(1)}% |\n\n`;
  }
  
  // Test suites section
  markdown += `## Test Suites\n\n`;
  
  testSuites.forEach(suite => {
    const status = suite.status === 'passed' ? '✅' : '❌';
    markdown += `### ${status} ${suite.name}\n\n`;
    markdown += `- **Status:** ${suite.status}\n`;
    markdown += `- **Duration:** ${suite.duration}ms\n`;
    markdown += `- **Tests:** ${suite.numPassed}/${suite.numTests} passed\n\n`;
    
    if (suite.numFailed > 0) {
      markdown += `#### Failed Tests\n\n`;
      suite.tests.filter(test => test.status === 'failed').forEach(test => {
        markdown += `- ❌ ${test.title}\n`;
        if (test.failureMessages.length > 0) {
          markdown += `  \`\`\`\n  ${test.failureMessages[0]}\n  \`\`\`\n`;
        }
      });
      markdown += `\n`;
    }
  });
  
  // Recommendations section
  markdown += `## Recommendations\n\n`;
  
  if (summary.failedTests > 0) {
    markdown += `- 🔧 Fix ${summary.failedTests} failing test(s)\n`;
  }
  
  if (summary.coverage && (summary.coverage.lines || 0) < 80) {
    markdown += `- 📈 Increase test coverage (currently ${(summary.coverage.lines || 0).toFixed(1)}%, target: 80%)\n`;
  }
  
  if (summary.skippedTests > 0) {
    markdown += `- ⚠️ Review ${summary.skippedTests} skipped test(s)\n`;
  }
  
  if (summary.success) {
    markdown += `- ✨ All tests passing! Great work!\n`;
  }
  
  return markdown;
} 