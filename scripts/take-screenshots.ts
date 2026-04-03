import { chromium, type Browser, type Page } from 'playwright';
import { _electron as electron } from 'playwright';
import { spawn, type ChildProcess } from 'child_process';
import * as path from 'path';

// When compiled, __dirname is dist/scripts — go up two levels to repo root
const ROOT_DIR = path.resolve(__dirname, '..', '..');
const SCREENSHOTS_DIR = path.join(ROOT_DIR, 'docs', 'screenshots');
const GAME_URL = 'http://localhost:4200';
const CHROMIUM_PATH = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
  || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

/** Wait for a URL to become reachable */
async function waitForServer(url: string, timeoutMs = 30_000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // not ready yet
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Server at ${url} did not start within ${timeoutMs}ms`);
}

/** Start the Vite dev server for the game app */
function startDevServer(): ChildProcess {
  const proc = spawn('npx', ['nx', 'serve', 'game'], {
    cwd: ROOT_DIR,
    stdio: 'pipe',
    env: { ...process.env, FORCE_COLOR: '0' },
  });
  proc.stderr?.on('data', (d) => process.stderr.write(d));
  return proc;
}

/** Take a screenshot of the game web app in a browser */
async function screenshotWeb(browser: Browser): Promise<void> {
  console.log('Taking web game screenshot...');
  const page: Page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto(GAME_URL, { waitUntil: 'networkidle' });

  // Give R3F/Three.js time to render the scene
  await page.waitForTimeout(3000);

  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, 'game-web.png'),
    fullPage: false,
  });
  console.log('  Saved: docs/screenshots/game-web.png');
  await page.close();
}

/** Take a screenshot of the Electron app */
async function screenshotElectron(): Promise<void> {
  console.log('Taking Electron app screenshot...');

  // Build the electron app first
  const tscResult = spawn('npx', ['tsc', '-p', 'apps/game-electron/tsconfig.json', '--outDir', 'dist/apps/game-electron'], {
    cwd: ROOT_DIR,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  let tscStderr = '';
  tscResult.stderr?.on('data', (d) => { tscStderr += d.toString(); });
  tscResult.stdout?.on('data', (d) => { tscStderr += d.toString(); });
  await new Promise<void>((resolve, reject) => {
    tscResult.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`tsc exited with ${code}: ${tscStderr}`));
    });
  });

  const electronApp = await electron.launch({
    args: [
      '--no-sandbox',
      '--disable-gpu',
      path.join(ROOT_DIR, 'dist', 'apps', 'game-electron', 'main.js'),
    ],
    env: { ...process.env, DISPLAY: process.env.DISPLAY || ':99' },
  });

  const window = await electronApp.firstWindow();
  await window.setViewportSize({ width: 1280, height: 720 });

  // Wait for the page to load and R3F to render
  await window.waitForLoadState('networkidle');
  await window.waitForTimeout(3000);

  await window.screenshot({
    path: path.join(SCREENSHOTS_DIR, 'game-electron.png'),
  });
  console.log('  Saved: docs/screenshots/game-electron.png');

  await electronApp.close();
}

async function main(): Promise<void> {
  console.log('=== Crab Game Screenshot Generator ===\n');

  // Start the dev server
  console.log('Starting Vite dev server...');
  const devServer = startDevServer();

  try {
    await waitForServer(GAME_URL);
    console.log('Dev server is ready.\n');

    // Screenshot the web app
    const browser = await chromium.launch({
      executablePath: CHROMIUM_PATH,
      args: ['--no-sandbox', '--disable-gpu'],
    });

    try {
      await screenshotWeb(browser);
    } finally {
      await browser.close();
    }

    // Screenshot the Electron app
    await screenshotElectron();

    console.log('\nAll screenshots generated successfully!');
  } finally {
    devServer.kill('SIGTERM');
  }
}

main().catch((err) => {
  console.error('Screenshot generation failed:', err);
  process.exit(1);
});
