import { chromium, type Browser, type Page } from 'playwright';
import { _electron as electron } from 'playwright';
import { spawn, type ChildProcess } from 'child_process';
import * as path from 'path';

// When compiled, __dirname is dist/scripts — go up two levels to repo root
const ROOT_DIR = path.resolve(__dirname, '..', '..');
const CLIPS_DIR = path.join(ROOT_DIR, 'docs', 'clips');
const GAME_URL = 'http://localhost:4200';
const CHROMIUM_PATH =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

/** Default recording duration in milliseconds */
const CLIP_DURATION_MS = parseInt(process.env.CLIP_DURATION || '10000', 10);

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

/** Wait for the demo to start playing, then record for the given duration */
async function waitAndRecord(page: Page): Promise<void> {
  // Wait for R3F/Three.js to render and the demo AI to begin playing
  await page.waitForTimeout(3000);

  // Record the demo (AI plays automatically on the title screen)
  await page.waitForTimeout(CLIP_DURATION_MS);
}

/** Record a video clip of the web game */
async function recordWeb(browser: Browser): Promise<void> {
  console.log(`Recording web game clip (${CLIP_DURATION_MS / 1000}s)...`);

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: CLIPS_DIR,
      size: { width: 1280, height: 720 },
    },
  });
  const page = await context.newPage();
  await page.goto(GAME_URL, { waitUntil: 'networkidle' });

  await waitAndRecord(page);

  // Close page to finalize the video file
  const videoPath = await page.video()?.path();
  await page.close();
  await context.close();

  // Rename the auto-generated file to a known name
  if (videoPath) {
    const fs = await import('fs');
    const dest = path.join(CLIPS_DIR, 'game-web.webm');
    fs.renameSync(videoPath, dest);
    console.log('  Saved: docs/clips/game-web.webm');
  }
}

/** Record a video clip of the Electron app */
async function recordElectron(): Promise<void> {
  console.log(`Recording Electron app clip (${CLIP_DURATION_MS / 1000}s)...`);

  // Build the electron app first
  const tscResult = spawn(
    'npx',
    [
      'tsc',
      '-p',
      'apps/game-electron/tsconfig.json',
      '--outDir',
      'dist/apps/game-electron',
    ],
    { cwd: ROOT_DIR, stdio: ['pipe', 'pipe', 'pipe'] }
  );
  let tscStderr = '';
  tscResult.stderr?.on('data', (d) => {
    tscStderr += d.toString();
  });
  tscResult.stdout?.on('data', (d) => {
    tscStderr += d.toString();
  });
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
    recordVideo: {
      dir: CLIPS_DIR,
      size: { width: 1280, height: 720 },
    },
  });

  const window = await electronApp.firstWindow();
  await window.setViewportSize({ width: 1280, height: 720 });
  await window.waitForLoadState('networkidle');

  await waitAndRecord(window);

  const videoPath = await window.video()?.path();
  await electronApp.close();

  if (videoPath) {
    const fs = await import('fs');
    const dest = path.join(CLIPS_DIR, 'game-electron.webm');
    fs.renameSync(videoPath, dest);
    console.log('  Saved: docs/clips/game-electron.webm');
  }
}

async function main(): Promise<void> {
  console.log('=== Crab Game Video Clip Recorder ===');
  console.log(`Clip duration: ${CLIP_DURATION_MS / 1000}s (set CLIP_DURATION env to override)\n`);

  // Ensure output directory exists
  const fs = await import('fs');
  fs.mkdirSync(CLIPS_DIR, { recursive: true });

  // Start the dev server
  console.log('Starting Vite dev server...');
  const devServer = startDevServer();

  try {
    await waitForServer(GAME_URL);
    console.log('Dev server is ready.\n');

    // Record the web app
    const browser = await chromium.launch({
      executablePath: CHROMIUM_PATH,
      args: ['--no-sandbox', '--disable-gpu'],
    });

    try {
      await recordWeb(browser);
    } finally {
      await browser.close();
    }

    // Record the Electron app
    await recordElectron();

    console.log('\nAll video clips recorded successfully!');
  } finally {
    devServer.kill('SIGTERM');
  }
}

main().catch((err) => {
  console.error('Video recording failed:', err);
  process.exit(1);
});
