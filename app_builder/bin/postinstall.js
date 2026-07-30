const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('\n--- App Builder Lite: Running Post-Installation Setup ---\n');

// 1. Locate Python
let pythonCmd = null;
for (const cmd of ['python', 'python3', 'py']) {
  try {
    execSync(`${cmd} --version`, { stdio: 'ignore' });
    pythonCmd = cmd;
    break;
  } catch (e) {}
}

if (!pythonCmd) {
  console.warn('⚠️ WARNING: Python was not found in your system PATH!');
  console.warn('This tool requires Python >= 3.11 with the "rich" and "yaml" packages.');
  console.warn('Please install Python and run: pip install -r requirements-runtime.txt\n');
} else {
  console.log(`Found Python interpreter: ${pythonCmd}`);
  const reqPath = path.join(__dirname, '..', 'requirements-runtime.txt');
  if (fs.existsSync(reqPath)) {
    console.log('Installing Python dependencies via pip...');
    try {
      execSync(`${pythonCmd} -m pip install -r "${reqPath}"`, { stdio: 'inherit' });
      console.log('✓ Python dependencies installed successfully.');
    } catch (e) {
      console.warn('⚠️ WARNING: Failed to install Python dependencies automatically.');
      console.warn('Please run: pip install -r requirements-runtime.txt manually.\n');
    }
  }
}

// 2. Install opencode-ai global CLI
let hasOpencode = false;
try {
  execSync('opencode --version', { stdio: 'ignore' });
  hasOpencode = true;
  console.log('✓ opencode CLI is already installed.');
} catch (e) {}

if (!hasOpencode) {
  console.log('Installing opencode CLI globally...');
  try {
    execSync('npm install -g opencode-ai', { stdio: 'inherit' });
    console.log('✓ opencode CLI installed successfully.');
  } catch (e) {
    console.warn('\n⚠️ WARNING: Could not install opencode-ai globally due to permission restrictions.');
    console.warn('👉 Please install it manually by running: npm install -g opencode-ai (with sudo/Admin privileges)\n');
  }
}

console.log('--- Post-Installation Setup Complete ---\n');
