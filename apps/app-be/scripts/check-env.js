#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to parse .env file
function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const vars = {};
  
  content.split('\n').forEach(line => {
    // Skip comments and empty lines
    if (line.trim().startsWith('#') || !line.trim()) return;
    
    const [key] = line.split('=');
    if (key) {
      vars[key.trim()] = true;
    }
  });
  
  return vars;
}

// Parse both files
const envPath = path.join(__dirname, '..', '.env');
const examplePath = path.join(__dirname, '..', '.env.example');

const envVars = parseEnvFile(envPath);
const exampleVars = parseEnvFile(examplePath);

// Find differences
const missingInExample = Object.keys(envVars).filter(key => !exampleVars[key]);
const missingInEnv = Object.keys(exampleVars).filter(key => !envVars[key]);

console.log('🔍 Environment Variables Check\n');

if (missingInExample.length > 0) {
  console.log('❌ Variables in .env but missing in .env.example:');
  missingInExample.forEach(key => console.log(`   - ${key}`));
  console.log('');
}

if (missingInEnv.length > 0) {
  console.log('⚠️  Variables in .env.example but missing in .env:');
  missingInEnv.forEach(key => console.log(`   - ${key}`));
  console.log('');
}

if (missingInExample.length === 0 && missingInEnv.length === 0) {
  console.log('✅ Both files have the same environment variables!');
} else {
  console.log('💡 Tip: Keep .env.example updated with all required variables');
  console.log('   (without sensitive values) for other developers.');
}