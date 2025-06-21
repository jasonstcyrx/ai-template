#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const RULES_DIR = path.join(process.cwd(), "rules");
const GITHUB_INSTRUCTIONS_DIR = path.join(process.cwd(), ".github", "instructions");
const CURSOR_RULES_DIR = path.join(process.cwd(), ".cursor", "rules");

// GitHub instructions frontmatter
const GITHUB_FRONTMATTER = `---
applyTo: '**'
---

`;

// Ensure target directories exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
};

// Get all markdown files from rules directory
const getRuleFiles = () => {
  if (!fs.existsSync(RULES_DIR)) {
    console.error(`Rules directory not found: ${RULES_DIR}`);
    process.exit(1);
  }
  
  return fs.readdirSync(RULES_DIR)
    .filter(file => file.endsWith('.md'))
    .map(file => ({
      filename: file,
      baseName: path.basename(file, '.md'),
      fullPath: path.join(RULES_DIR, file)
    }));
};

// Copy file to target directory with new extension
const copyFileWithExtension = (sourceFile, targetDir, newExtension, addFrontmatter = false) => {
  const targetPath = path.join(targetDir, `${sourceFile.baseName}.${newExtension}`);
  
  try {
    let content = fs.readFileSync(sourceFile.fullPath, 'utf8');
    
    // Add frontmatter for GitHub instructions
    if (addFrontmatter) {
      // For GitHub instructions, we want to ensure it has the applyTo: '**' frontmatter
      const targetFrontmatter = "---\napplyTo: '**'\n---\n\n";
      
      // Check if content already has the target frontmatter at the start
      if (content.startsWith(targetFrontmatter.trim())) {
        // Already correct, do nothing
      } else {
        // Remove any existing frontmatter blocks and add our target frontmatter
        let cleanContent = content;
        
        // Remove all frontmatter blocks at the start
        while (cleanContent.startsWith('---')) {
          const endIndex = cleanContent.indexOf('\n---\n', 4);
          if (endIndex !== -1) {
            cleanContent = cleanContent.substring(endIndex + 5);
          } else {
            // Try alternative pattern
            const altEndIndex = cleanContent.indexOf('\n---', 4);
            if (altEndIndex !== -1 && cleanContent.substring(altEndIndex + 1, altEndIndex + 4) === '---') {
              cleanContent = cleanContent.substring(altEndIndex + 4);
            } else {
              break; // No more frontmatter found
            }
          }
        }
        
        // Clean up any leading whitespace
        cleanContent = cleanContent.replace(/^\s+/, '');
        
        // Add our target frontmatter
        content = targetFrontmatter + cleanContent;
      }
    }
    
    fs.writeFileSync(targetPath, content);
    console.log(`✓ Synced: ${sourceFile.filename} → ${path.relative(process.cwd(), targetPath)}`);
  } catch (error) {
    console.error(`✗ Failed to sync ${sourceFile.filename}:`, error.message);
  }
};

// Clean up old files that no longer exist in rules
const cleanupStaleFiles = (targetDir, extension, currentRuleFiles) => {
  if (!fs.existsSync(targetDir)) return;
  
  const currentBasenames = new Set(currentRuleFiles.map(f => f.baseName));
  const targetFiles = fs.readdirSync(targetDir)
    .filter(file => file.endsWith(`.${extension}`));
    
  targetFiles.forEach(file => {
    const baseName = path.basename(file, `.${extension}`);
    if (!currentBasenames.has(baseName)) {
      const filePath = path.join(targetDir, file);
      try {
        fs.unlinkSync(filePath);
        console.log(`🗑️  Removed stale file: ${path.relative(process.cwd(), filePath)}`);
      } catch (error) {
        console.error(`✗ Failed to remove ${file}:`, error.message);
      }
    }
  });
};

// Main sync function
const syncRules = () => {
  console.log("🔄 Syncing rules files...\n");
  
  // Ensure target directories exist
  ensureDirectoryExists(GITHUB_INSTRUCTIONS_DIR);
  ensureDirectoryExists(CURSOR_RULES_DIR);
  
  // Get all rule files
  const ruleFiles = getRuleFiles();
  console.log(`Found ${ruleFiles.length} rule files to sync\n`);
  
  // Clean up stale files first
  console.log("🧹 Cleaning up stale files...");
  cleanupStaleFiles(GITHUB_INSTRUCTIONS_DIR, "instructions.md", ruleFiles);
  cleanupStaleFiles(CURSOR_RULES_DIR, "mdc", ruleFiles);
  
  if (ruleFiles.length === 0) {
    console.log("No files to sync.");
    return;
  }
  
  console.log("\n📋 Syncing to GitHub instructions (with frontmatter)...");
  ruleFiles.forEach(file => {
    copyFileWithExtension(file, GITHUB_INSTRUCTIONS_DIR, "instructions.md", true);
  });
  
  console.log("\n🎯 Syncing to Cursor rules...");
  ruleFiles.forEach(file => {
    copyFileWithExtension(file, CURSOR_RULES_DIR, "mdc", false);
  });
  
  console.log(`\n✅ Sync complete! Processed ${ruleFiles.length} files.`);
};

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Rules Sync Utility

Usage: node scripts/sync-rules.js [options]

Options:
  --help, -h     Show this help message
  --watch, -w    Watch for changes and auto-sync (not implemented yet)

This script syncs all .md files from the rules/ directory to:
- .github/instructions/*.instructions.md (with frontmatter: applyTo: '**')
- .cursor/rules/*.mdc (original content)

The script also cleans up any stale files in the target directories.
`);
  process.exit(0);
}

// Run the sync
syncRules(); 