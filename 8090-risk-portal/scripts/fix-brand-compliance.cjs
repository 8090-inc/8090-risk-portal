#!/usr/bin/env node

/**
 * Script to fix brand compliance issues in the codebase
 * 
 * This script will:
 * 1. Replace font-bold with font-semibold
 * 2. Replace gray-* colors with slate-*
 * 3. Update rounded corners where appropriate
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Colors to replace
const colorReplacements = [
  { from: /\bborder-gray-200\b/g, to: 'border-slate-200' },
  { from: /\bborder-gray-300\b/g, to: 'border-slate-300' },
  { from: /\btext-gray-900\b/g, to: 'text-slate-900' },
  { from: /\btext-gray-700\b/g, to: 'text-slate-700' },
  { from: /\btext-gray-600\b/g, to: 'text-slate-600' },
  { from: /\btext-gray-500\b/g, to: 'text-slate-500' },
  { from: /\bbg-gray-50\b/g, to: 'bg-slate-50' },
  { from: /\bbg-gray-100\b/g, to: 'bg-slate-100' },
  { from: /\bbg-gray-200\b/g, to: 'bg-slate-200' },
];

// Font weight replacement
const fontWeightReplacement = { from: /\bfont-bold\b/g, to: 'font-semibold' };

// Files to process
const filePatterns = [
  'src/**/*.tsx',
  'src/**/*.jsx',
  'src/**/*.ts',
  'src/**/*.js'
];

let totalReplacements = 0;
const modifiedFiles = new Set();

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let fileReplacements = 0;

  // Replace font-bold with font-semibold
  const fontBoldMatches = content.match(fontWeightReplacement.from) || [];
  if (fontBoldMatches.length > 0) {
    content = content.replace(fontWeightReplacement.from, fontWeightReplacement.to);
    fileReplacements += fontBoldMatches.length;
    console.log(`  - Replaced ${fontBoldMatches.length} instances of font-bold with font-semibold`);
  }

  // Replace gray colors with slate colors
  colorReplacements.forEach(({ from, to }) => {
    const matches = content.match(from) || [];
    if (matches.length > 0) {
      content = content.replace(from, to);
      fileReplacements += matches.length;
      console.log(`  - Replaced ${matches.length} instances of ${from.source} with ${to}`);
    }
  });

  // Only write if changes were made
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    modifiedFiles.add(filePath);
    totalReplacements += fileReplacements;
    console.log(`✓ Updated ${path.relative(process.cwd(), filePath)} (${fileReplacements} replacements)`);
  }
}

console.log('🔍 Scanning for brand compliance issues...\n');

// Process all files
filePatterns.forEach(pattern => {
  const files = glob.sync(pattern);
  files.forEach(processFile);
});

console.log('\n📊 Summary:');
console.log(`Total replacements: ${totalReplacements}`);
console.log(`Files modified: ${modifiedFiles.size}`);

if (modifiedFiles.size > 0) {
  console.log('\n📝 Modified files:');
  modifiedFiles.forEach(file => {
    console.log(`  - ${path.relative(process.cwd(), file)}`);
  });
}

console.log('\n✅ Brand compliance fixes complete!');
console.log('\n⚠️  Note: Some rounded corners may need manual review:');
console.log('  - rounded → rounded-lg for cards and containers');
console.log('  - rounded-full → rounded-lg for pills/badges (case by case)');
console.log('\n💡 Run "npm run dev" to see the changes in action.');