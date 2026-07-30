#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const tuiPath = path.join(__dirname, '..', 'tui.py');

// Find a valid python command
let pythonCmd = null;
const commands = ['python', 'python3', 'py'];

function checkPython() {
  for (const cmd of commands) {
    try {
      const { execSync } = require('child_process');
      execSync(`${cmd} --version`, { stdio: 'ignore' });
      pythonCmd = cmd;
      break;
    } catch (e) {}
  }
}

checkPython();

if (!pythonCmd) {
  console.error('\n❌ Error: Python interpreter not found!');
  console.error('This CLI tool requires Python >= 3.11 to run.');
  console.error('Please install Python and make sure it is added to your PATH.\n');
  process.exit(1);
}

// Check for GUI launcher command
const userArgs = process.argv.slice(2);
const firstArg = userArgs[0] ? userArgs[0].toLowerCase() : '';

if (firstArg === 'gui' || firstArg === 'dashboard' || firstArg === '--gui') {
  const dashboardPath = path.join(__dirname, '..', 'dashboard.py');
  console.log('\n🚀 Launching HACKIT Web GUI Dashboard...');
  console.log('🌐 Opening http://127.0.0.1:4097 in your browser...\n');

  const child = spawn(pythonCmd, [dashboardPath], {
    stdio: 'inherit',
    env: { ...process.env, PYTHONUNBUFFERED: '1' }
  });

  // Open browser after short delay
  setTimeout(() => {
    const url = 'http://127.0.0.1:4097';
    const startCmd = process.platform === 'win32' ? `start ${url}`
                   : process.platform === 'darwin' ? `open ${url}`
                   : `xdg-open ${url}`;
    try {
      const { exec } = require('child_process');
      exec(startCmd);
    } catch (e) {}
  }, 1500);

  child.on('close', (code) => {
    process.exit(code || 0);
  });
} else {
  // Spawn the HACKIT Interactive TUI script
  const args = [tuiPath, ...userArgs];
  const child = spawn(pythonCmd, args, {
    stdio: 'inherit',
    env: {
      ...process.env,
      PYTHONUNBUFFERED: '1'
    }
  });

  child.on('close', (code) => {
    process.exit(code || 0);
  });
}
