const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const path = require('node:path');

const cwd = __dirname;
const port = 4173;
const baseUrl = `http://127.0.0.1:${port}`;

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, attempts = 20) {
  let lastError;
  for (let i = 0; i < attempts; i += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
      lastError = new Error(`HTTP ${response.status} for ${url}`);
    } catch (error) {
      lastError = error;
    }
    await wait(200);
  }
  throw lastError;
}

async function run() {
  const server = spawn('python3', ['-m', 'http.server', String(port)], {
    cwd,
    stdio: 'ignore'
  });

  try {
    const htmlResponse = await fetchWithRetry(baseUrl);
    const html = await htmlResponse.text();

    assert.match(html, /id="driverSize"/);
    assert.match(html, /id="cabinetStyle"/);
    assert.match(html, /id="targetNetVolume"/);
    assert.match(html, /id="boxDiagram"/);
    assert.match(html, /id="threePreview"/);
    assert.match(html, /id="warnings"/);

    const cssResponse = await fetchWithRetry(`${baseUrl}/styles.css?v=2026-06-19-01`);
    assert.equal(cssResponse.status, 200);

    const mathResponse = await fetchWithRetry(`${baseUrl}/src/js/boxMath.js?v=2026-06-19-01`);
    assert.equal(mathResponse.status, 200);

    const uiResponse = await fetchWithRetry(`${baseUrl}/src/js/boxUI.js?v=2026-06-19-01`);
    assert.equal(uiResponse.status, 200);

    const validationResponse = await fetchWithRetry(`${baseUrl}/src/js/boxValidation.js?v=2026-06-19-01`);
    const validationJs = await validationResponse.text();
    assert.match(validationJs, /createValidator/);

    const render2dResponse = await fetchWithRetry(`${baseUrl}/src/js/boxRender2d.js?v=2026-06-19-01`);
    assert.equal(render2dResponse.status, 200);

    const appResponse = await fetchWithRetry(`${baseUrl}/app.js?v=2026-06-19-01`);
    const appJs = await appResponse.text();
    assert.match(appJs, /function renderUI/);
    assert.match(appJs, /window\.BoxValidation\.createValidator/);

    console.log('✓ local HTTP smoke passed');
  } finally {
    server.kill('SIGTERM');
  }
}

run().catch((error) => {
  console.error('❌ local HTTP smoke failed');
  console.error(error);
  process.exitCode = 1;
});
