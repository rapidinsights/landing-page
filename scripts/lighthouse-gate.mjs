// Runs Lighthouse mobile against the built output and fails the build on the
// performance guardrails documented in CLAUDE.md. Wired into CI as `pnpm run audit`.
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

const ROUTES = ['/'];
const REPORT_DIR = '.lighthouse';

// Guardrails from CLAUDE.md, gated on `/`.
const MIN_HOME_PERFORMANCE = 95;
const MIN_ACCESSIBILITY = 100;
const MAX_LCP_SECONDS = 2.0;

const SERVER_READY_TIMEOUT_MS = 30_000;

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${command} exited with ${code}`))));
  });
}

function getFreePort() {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.on('error', reject);
    probe.listen(0, '127.0.0.1', () => {
      const { port } = probe.address();
      probe.close(() => resolve(port));
    });
  });
}

async function waitForServer(origin, preview) {
  const deadline = Date.now() + SERVER_READY_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (preview.exitCode !== null) {
      throw new Error(`Preview server exited with ${preview.exitCode} before serving:\n${preview.stderrText()}`);
    }
    try {
      const response = await fetch(origin);
      if (response.ok) return;
    } catch {
      // Server is not accepting connections yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Preview server did not respond at ${origin} within ${SERVER_READY_TIMEOUT_MS}ms`);
}

// detached so the whole process group can be signalled — astro preview forks a
// child of its own, and killing only the parent leaves the port held.
function startPreview(port) {
  const astroBin = join(process.cwd(), 'node_modules', '.bin', 'astro');
  const child = spawn(astroBin, ['preview', '--port', String(port), '--host', '127.0.0.1'], {
    stdio: ['ignore', 'ignore', 'pipe'],
    detached: true,
  });

  // Without a listener, a missing astro binary emits 'error' as an uncaught
  // exception, escaping the try/finally that tears the server down.
  let stderr = '';
  child.on('error', (error) => {
    stderr += `${error.message}\n`;
  });
  child.stderr.on('data', (chunk) => {
    stderr += chunk;
  });
  child.stderrText = () => stderr.trim() || '(no output)';

  return child;
}

function stopPreview(child) {
  if (!child || child.exitCode !== null) return;
  try {
    process.kill(-child.pid, 'SIGTERM');
  } catch {
    child.kill('SIGTERM');
  }
}

function slugForRoute(route) {
  return route === '/' ? 'home' : route.replace(/^\//, '').replace(/\//g, '-');
}

async function auditRoute(origin, route, chromePort) {
  // Lighthouse's default config is the mobile preset (Moto G emulation + 4G throttling).
  const result = await lighthouse(`${origin}${route}`, { port: chromePort, output: 'json', logLevel: 'error' });
  if (!result?.lhr) throw new Error(`Lighthouse returned no result for ${route}`);
  const { lhr } = result;

  await writeFile(join(REPORT_DIR, `${slugForRoute(route)}.json`), JSON.stringify(lhr, null, 2));

  return {
    route,
    performance: Math.round(lhr.categories.performance.score * 100),
    accessibility: Math.round(lhr.categories.accessibility.score * 100),
    bestPractices: Math.round(lhr.categories['best-practices'].score * 100),
    seo: Math.round(lhr.categories.seo.score * 100),
    lcpSeconds: lhr.audits['largest-contentful-paint'].numericValue / 1000,
    cls: lhr.audits['cumulative-layout-shift'].numericValue,
  };
}

function printTable(results) {
  const header = ['Route', 'Perf', 'A11y', 'Best', 'SEO', 'LCP', 'CLS'];
  const rows = results.map((r) => [
    r.route,
    String(r.performance),
    String(r.accessibility),
    String(r.bestPractices),
    String(r.seo),
    `${r.lcpSeconds.toFixed(2)}s`,
    r.cls.toFixed(3),
  ]);
  const widths = header.map((_, i) => Math.max(header[i].length, ...rows.map((row) => row[i].length)));
  const line = (cells) => cells.map((cell, i) => cell.padEnd(widths[i])).join('  ');

  console.log('');
  console.log(line(header));
  console.log(widths.map((w) => '-'.repeat(w)).join('  '));
  for (const row of rows) console.log(line(row));
  console.log('');
}

function collectFailures(results) {
  const failures = [];
  for (const r of results) {
    if (r.route === '/' && r.performance < MIN_HOME_PERFORMANCE) {
      failures.push(`${r.route} Performance ${r.performance} is below the ${MIN_HOME_PERFORMANCE} floor`);
    }
    if (r.accessibility < MIN_ACCESSIBILITY) {
      failures.push(`${r.route} Accessibility ${r.accessibility} is below the ${MIN_ACCESSIBILITY} floor`);
    }
    if (r.lcpSeconds >= MAX_LCP_SECONDS) {
      failures.push(`${r.route} LCP ${r.lcpSeconds.toFixed(2)}s is at or above the ${MAX_LCP_SECONDS}s ceiling`);
    }
  }
  return failures;
}

async function main() {
  // Always rebuild. Auditing a stale dist/ reports a confident green table for
  // code that is no longer there, which is the one thing a gate must not do.
  if (existsSync('dist')) {
    console.log('Rebuilding so the audit measures current source.');
  }
  await run('pnpm', ['run', 'build']);

  await mkdir(REPORT_DIR, { recursive: true });

  const port = await getFreePort();
  const origin = `http://127.0.0.1:${port}`;
  let preview;
  let chrome;

  const cleanup = () => {
    chrome?.kill();
    stopPreview(preview);
  };
  // startPreview is detached, so a terminal SIGINT never reaches it: without
  // these the preview server and Chrome survive a Ctrl-C and hold the port.
  const onSignal = (signal) => {
    cleanup();
    process.exit(signal === 'SIGINT' ? 130 : 143);
  };
  process.on('SIGINT', onSignal);
  process.on('SIGTERM', onSignal);

  try {
    preview = startPreview(port);
    await waitForServer(origin, preview);

    chrome = await chromeLauncher.launch({ chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'] });

    const results = [];
    for (const route of ROUTES) {
      results.push(await auditRoute(origin, route, chrome.port));
    }

    printTable(results);
    console.log(`Full reports written to ${REPORT_DIR}/`);

    const failures = collectFailures(results);
    if (failures.length > 0) {
      console.error('Lighthouse gate FAILED:');
      for (const failure of failures) console.error(`  - ${failure}`);
      process.exitCode = 1;
      return;
    }
    console.log('Lighthouse gate passed.');
  } finally {
    process.off('SIGINT', onSignal);
    process.off('SIGTERM', onSignal);
    cleanup();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
