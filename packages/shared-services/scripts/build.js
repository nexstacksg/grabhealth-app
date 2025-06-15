#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building shared-services...');

// Run TypeScript compiler
execSync('tsc', { stdio: 'inherit' });

// Fix dist structure by moving files from nested folders
const distDir = path.join(__dirname, '..', 'dist');
const nestedSrcDir = path.join(distDir, 'shared-services', 'src');

if (fs.existsSync(nestedSrcDir)) {
  console.log('Fixing dist structure...');
  
  // Copy all files from nested src to dist root
  execSync(`cp -r "${nestedSrcDir}"/* "${distDir}"/`, { stdio: 'inherit' });
  
  // Remove nested folders
  execSync(`rm -rf "${distDir}/shared-services" "${distDir}/shared-types"`, { stdio: 'inherit' });
  
  console.log('Dist structure fixed!');
}

console.log('Build complete!');