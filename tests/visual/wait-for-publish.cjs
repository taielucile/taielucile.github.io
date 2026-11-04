const fs = require('node:fs');
const {setTimeout: pause} = require('node:timers/promises');
const base = 'https://taielucile.github.io/';
const files = ['index.html', 'about.html', 'research.html', 'methods.html', 'publications.html', 'news.html', 'cv.html', 'styles.css'];
const expected = new Map(files.map(file => [file, fs.readFileSync(file, 'utf8').trim()]));
const deadline = Date.now() + 8 * 60 * 1000;
(async () => {
  let attempt = 0;
  while (Date.now() < deadline) {
    attempt++;
    try {
      const stamp = (process.env.GITHUB_SHA || 'review') + '-' + attempt;
      const matches = await Promise.all(files.map(async file => {
        const url = new URL(file, base);
        url.searchParams.set('qa', stamp);
        const response = await fetch(url, {signal: AbortSignal.timeout(10000), cache: 'no-store'});
        return response.ok && (await response.text()).trim() === expected.get(file);
      }));
      if (matches.every(Boolean)) {
        console.log('All seven published pages and the stylesheet match this checkout.');
        return;
      }
    } catch {}
    if (attempt % 6 === 1) console.log('Waiting for this revision to finish publishing.');
    await pause(5000);
  }
  throw new Error('The published site did not match this checkout within eight minutes.');
})().catch(error => { console.error(error.message); process.exitCode = 1; });
