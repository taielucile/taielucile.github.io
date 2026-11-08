const { test, expect } = require('@playwright/test');
const revision = process.env.GITHUB_SHA || 'about';

for (const width of [320, 390, 768, 1440]) {
  test(`About keeps a clear reading order and shared alignment at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(`/about.html?qa=${revision}`);
    await page.evaluate(() => document.fonts.ready);
    const intro = await page.locator('.about-intro').boundingBox();
    const bio = await page.locator('.about-biography').boundingBox();
    const profile = await page.locator('.about-profile').boundingBox();
    const photo = await page.locator('.about-headshot').boundingBox();
    const education = await page.locator('.about-education').boundingBox();
    expect(Math.abs(intro.x - bio.x)).toBeLessThanOrEqual(1);
    if (width > 760) {
      expect(Math.abs(intro.y - profile.y)).toBeLessThanOrEqual(1);
      expect(Math.abs(photo.x - education.x)).toBeLessThanOrEqual(1);
      expect(bio.x + bio.width).toBeLessThanOrEqual(profile.x);
    } else {
      expect(profile.y).toBeGreaterThanOrEqual(intro.y + intro.height);
      expect(bio.y).toBeGreaterThanOrEqual(profile.y + profile.height + 20);
      expect(education.x).toBeGreaterThanOrEqual(photo.x + photo.width);
    }
    const dates = await page.locator('.recognition-date').evaluateAll(nodes => nodes.map(n => n.getBoundingClientRect().right));
    expect(Math.max(...dates) - Math.min(...dates)).toBeLessThanOrEqual(1);
    await expect(page.locator('.recognition-list > li')).toHaveCount(5);
    await expect(page.locator('.about-education')).toContainText('Africana Studies');
  });
}
