#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { program } = require("commander");

const RULES_DIR = path.join(process.cwd(), "rules");
const BASIC_RULES_FILE = path.join(RULES_DIR, "basic.md");

// Default frontmatter template
const createFrontmatter = (description = "", globs = "", alwaysApply = true) => {
  return `---
description: ${description}
globs: ${globs}
alwaysApply: ${alwaysApply}
---`;
};

// Template for a new rule file
const createRuleTemplate = (title, description, content) => {
  const frontmatter = createFrontmatter(description);
  
  // Process content to handle escape sequences
  let processedContent = content;
  if (content) {
    processedContent = content
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\\\/g, '\\');
  }
  
  return `${frontmatter}
# ${title}

${processedContent || `## Overview
This rule defines...

## Requirements
- Requirement 1
- Requirement 2

## Examples
\`\`\`
Example code or usage
\`\`\`

## Best Practices
- Best practice 1
- Best practice 2
`}`;
};

// Ensure rules directory exists
const ensureRulesDirectory = () => {
  if (!fs.existsSync(RULES_DIR)) {
    fs.mkdirSync(RULES_DIR, { recursive: true });
    console.log(`Created rules directory: ${RULES_DIR}`);
  }
};

// Create the rule file
const createRuleFile = (filename, title, description, content) => {
  const filePath = path.join(RULES_DIR, `${filename}.md`);
  
  if (fs.existsSync(filePath)) {
    console.error(`❌ Rule file already exists: ${filename}.md`);
    process.exit(1);
  }
  
  const ruleContent = createRuleTemplate(title, description, content);
  
  try {
    fs.writeFileSync(filePath, ruleContent);
    console.log(`✓ Created rule file: ${path.relative(process.cwd(), filePath)}`);
    return filePath;
  } catch (error) {
    console.error(`❌ Failed to create rule file: ${error.message}`);
    process.exit(1);
  }
};

// Update basic.md index file
const updateBasicIndex = (filename, title) => {
  if (!fs.existsSync(BASIC_RULES_FILE)) {
    console.log("📝 Creating basic.md index file...");
    fs.writeFileSync(BASIC_RULES_FILE, "");
  }
  
  try {
    let content = fs.readFileSync(BASIC_RULES_FILE, 'utf8');
    const newLink = `[${title}](./${filename}.md)`;
    
    // Check if link already exists
    if (content.includes(newLink)) {
      console.log("📋 Link already exists in basic.md");
      return;
    }
    
    // Add the new link in alphabetical order
    const lines = content.split('\n').filter(line => line.trim());
    lines.push(newLink);
    lines.sort();
    
    const updatedContent = lines.join('\n') + '\n\n';
    fs.writeFileSync(BASIC_RULES_FILE, updatedContent);
    console.log(`✓ Updated basic.md index with link to ${filename}.md`);
  } catch (error) {
    console.error(`⚠️  Failed to update basic.md: ${error.message}`);
  }
};

// Run sync script
const runSync = () => {
  try {
    console.log("\n🔄 Running sync script...");
    execSync("npm run sync-rules", { stdio: "inherit" });
  } catch (error) {
    console.error("⚠️  Failed to run sync script:", error.message);
  }
};

// Validate filename
const validateFilename = (filename) => {
  const validPattern = /^[a-z0-9-]+$/;
  if (!validPattern.test(filename)) {
    console.error("❌ Filename must contain only lowercase letters, numbers, and hyphens");
    process.exit(1);
  }
  
  if (filename.endsWith('.md')) {
    console.error("❌ Don't include .md extension in filename");
    process.exit(1);
  }
};

// Main command setup
program
  .version("1.0.0")
  .description("Create new rule files in the rules directory");

program
  .command("create")
  .description("Create a new rule file")
  .requiredOption("-n, --name <name>", "Rule filename (without .md extension)")
  .requiredOption("-t, --title <title>", "Rule title")
  .option("-d, --description <description>", "Rule description for frontmatter", "")
  .option("-c, --content <content>", "Rule content (markdown)")
  .option("--no-sync", "Skip running sync script after creation")
  .option("--no-index", "Skip updating basic.md index file")
  .action((options) => {
    console.log("📝 Creating new rule file...\n");
    
    // Validate inputs
    validateFilename(options.name);
    
    // Ensure rules directory exists
    ensureRulesDirectory();
    
    // Create the rule file
    const filePath = createRuleFile(
      options.name,
      options.title,
      options.description,
      options.content
    );
    
    // Update basic.md index
    if (options.index) {
      updateBasicIndex(options.name, options.title);
    }
    
    // Run sync script
    if (options.sync) {
      runSync();
    }
    
    console.log(`\n✅ Rule creation complete!`);
    console.log(`📁 File: ${path.relative(process.cwd(), filePath)}`);
    
    if (!options.sync) {
      console.log("\n💡 Run 'npm run sync-rules' to sync to .github and .cursor directories");
    }
  });

program
  .command("template")
  .description("Show template for rule file content")
  .action(() => {
    console.log("Rule File Template:");
    console.log("==================");
    console.log(createRuleTemplate("Rule Title", "Brief description", ""));
  });

// Show help if no command provided
if (process.argv.length <= 2) {
  program.help();
}

program.parse(process.argv); 