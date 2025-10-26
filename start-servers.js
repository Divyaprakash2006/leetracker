#!/usr/bin/env node
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendDir = path.join(__dirname, 'backend');
const frontendDir = path.join(__dirname, 'frontend');

console.log('🚀 Starting LeetCode Tracker (Backend + Frontend)\n');

// Start backend
console.log('📦 Starting Backend Server (Port 5001)...');
const backend = spawn('npm', ['run', 'dev'], {
  cwd: backendDir,
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PORT: '5001' }
});

// Wait a bit for backend to start
setTimeout(() => {
  console.log('\n🎨 Starting Frontend Server (Port 3000)...\n');
  const frontend = spawn('npm', ['run', 'dev'], {
    cwd: frontendDir,
    stdio: 'inherit',
    shell: true
  });

  frontend.on('error', (err) => {
    console.error('Frontend error:', err);
  });
}, 3000);

backend.on('error', (err) => {
  console.error('Backend error:', err);
});

process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down servers...');
  backend.kill();
  process.exit(0);
});