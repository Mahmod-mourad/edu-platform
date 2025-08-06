// This is a temporary script to help generate package-lock.json
// Run this locally: node generate-package-lock.js

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing npm dependencies...');

try {
  // Remove existing node_modules and lock file if they exist
  if (fs.existsSync('node_modules')) {
    console.log('📦 Removing existing node_modules...');
    execSync('rm -rf node_modules', { stdio: 'inherit' });
  }
  
  if (fs.existsSync('package-lock.json')) {
    console.log('🔒 Removing existing package-lock.json...');
    fs.unlinkSync('package-lock.json');
  }

  // Clear npm cache
  console.log('🧹 Clearing npm cache...');
  execSync('npm cache clean --force', { stdio: 'inherit' });

  // Install dependencies to generate fresh package-lock.json
  console.log('📥 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  console.log('✅ package-lock.json generated successfully!');
  console.log('📋 Now you can run: docker-compose up -d');

} catch (error) {
  console.error('❌ Error:', error.message);
  console.log('\n📝 Manual steps:');
  console.log('1. Delete node_modules folder');
  console.log('2. Delete package-lock.json file');
  console.log('3. Run: npm install');
  console.log('4. Run: docker-compose up -d');
}