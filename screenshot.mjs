import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotsDir = path.join(__dirname, 'temporary screenshots');

// Ensure output directory exists
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Determine next auto-incremented filename
function getNextFilename(label) {
  const files = fs.existsSync(screenshotsDir)
    ? fs.readdirSync(screenshotsDir).filter(f => f.startsWith('screenshot-') && f.endsWith('.png'))
    : [];

  const numbers = files
    .map(f => parseInt(f.match(/screenshot-(\d+)/)?.[1]))
    .filter(n => !isNaN(n));

  const next = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
  const suffix = label ? `-${label}` : '';
  return path.join(screenshotsDir, `screenshot-${next}${suffix}.png`);
}

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(url, { waitUntil: 'networkidle2' });

const filename = getNextFilename(label);
await page.screenshot({ path: filename, fullPage: true });

await browser.close();

console.log(`Screenshot saved: ${filename}`);
