/**
 * Starts the Expo web server and opens it in Cursor's Simple Browser.
 * Run: node scripts/start-web-in-cursor.js
 */
const { spawn } = require('child_process');
const http = require('http');
const { execSync } = require('child_process');

const PORT = 8081;
const path = process.argv.includes('--picker') ? '/pin-location' : '';
const URL = `http://localhost:${PORT}${path}`;
const SIMPLE_BROWSER_URL = `vscode://vscode.simple-browser/show?url=${encodeURIComponent(URL)}`;

function waitForServer(maxAttempts = 60) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const tryConnect = () => {
      attempts++;
      const req = http.get(URL, (res) => resolve());
      req.on('error', () => {
        if (attempts >= maxAttempts) reject(new Error('Server did not start in time'));
        else setTimeout(tryConnect, 500);
      });
    };
    tryConnect();
  });
}

function openInCursor() {
  try {
    execSync(`cursor --open-url "${SIMPLE_BROWSER_URL}"`, { stdio: 'ignore' });
    console.log('Opened in Cursor Simple Browser.');
  } catch {
    try {
      execSync(`code --open-url "${SIMPLE_BROWSER_URL}"`, { stdio: 'ignore' });
      console.log('Opened in VS Code Simple Browser.');
    } catch {
      console.log('\nTo open in Cursor: Ctrl+Shift+P → "Simple Browser: Show" → paste:', URL);
    }
  }
}

const usePicker = process.argv.includes('--picker');

if (usePicker) {
  const updateServer = spawn('node', ['scripts/update-coords-server.js'], {
    stdio: 'pipe',
    cwd: __dirname + '/..',
  });
  updateServer.on('error', (err) => console.warn('Update server failed:', err.message));
  updateServer.stderr?.on('data', (d) => process.stderr.write(d));
}

console.log('Starting Expo web server (will open in Cursor, not external browser)...');
const child = spawn('npm', ['run', 'web'], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname + '/..',
  env: { ...process.env, BROWSER: 'none' },
});

child.on('error', (err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});

// Wait for server, then open browser
setTimeout(() => {
  waitForServer()
    .then(openInCursor)
    .catch((e) => console.warn(e.message));
}, 3000);
