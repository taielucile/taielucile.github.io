const fs = require('node:fs');
const {setTimeout: pause} = require('node:timers/promises');
const base = 'https://taielucile.github.io/';
const expectedPage = fs.readFileSync('index.html', 'utf8').trim();
const expectedCss = fs.readFileSync('styles.css', 'utf8').trim();
const stylesheet = expectedPage.match(/href="([^"]*styles\.css[^"]*)"/)[1];
const deadline = Date.now() + 8 * 60 * 1000;
(async () => {
  let attempt = 0;
  while (Date.now() < deadline) {
    attempt++;
    try {
      const stamp = (process.env.GITHUB_SHA || 'review') + '-' + attempt;
      const pageUrl = new URL(base);
      pageUrl.searchParams.set('qa', stamp);
      const cssUrl = new URL(stylesheet, base);
      cssUrl.searchParams.set('qa', stamp);
      const responses = await Promise.all([pageUrl, cssUrl].map(url => fetch(url, {signal: AbortSignal.timeout(10000), cache: 'no-store'})));
      if (responses.every(r => r.ok)) {
        const [page, css] = await Promise.all(responses.map(r => r.text()));
        if (page.trim() === expectedPage && css.trim() === expectedCss) {
          console.log('The published homepage and stylesheet match this checkout.');
          return;
        }
      }
    } catch {}
    if (attempt % 6 === 1) console.log('Waiting for this revision to finish publishing.');
    await pause(5000);
  }
  throw new Error('The published site did not match this checkout within eight minutes.');
})().catch(error => { console.error(error.message); process.exitCode = 1; });
