const fs = require('fs');
const path = require('path');

module.exports = async () => {
  console.log('🧹 Cleaning up global test environment...');
  
  // Clean up test artifacts but preserve test results
  const cleanupDirs = [
    path.join(__dirname, '../test-tickets'),
    path.join(__dirname, '../test-apps'),
    path.join(__dirname, '../test-workflow'),
    path.join(__dirname, 'data')
  ];
  
  cleanupDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      try {
        fs.rmSync(dir, { recursive: true, force: true });
        console.log(`  ✓ Cleaned up ${dir}`);
      } catch (error) {
        console.warn(`  ⚠️  Failed to clean up ${dir}: ${error.message}`);
      }
    }
  });
  
  // Clean up temporary docker-compose test files
  const tempFiles = [
    'test-docker-compose.yml',
    'test-docker-compose.prod.yml'
  ];
  
  tempFiles.forEach(file => {
    if (fs.existsSync(file)) {
      try {
        fs.unlinkSync(file);
        console.log(`  ✓ Cleaned up ${file}`);
      } catch (error) {
        console.warn(`  ⚠️  Failed to clean up ${file}: ${error.message}`);
      }
    }
  });
  
  // Reset environment variables
  delete process.env.TEST_MODE;
  delete process.env.TICKET_ROOT;
  
  console.log('✅ Global test environment cleanup complete');
}; 