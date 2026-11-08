const { test, expect } = require('@playwright/test');

const revision = process.env.GITHUB_SHA || 'ux';
const fresh = path => `${path}?qa=${revision}`;

for (const width of [320, 390]) {
  test(`mobile navigation opens, closes, and follows links at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(fresh('/'));
    const menu = page.getByRole('button', { name: /Menu/ });
    const navigation = page.getByRole('navigation', { name: 'Primary navigation' });
    await expect(menu).toBeVisible();
    await expect(navigation).toBeHidden();
    await menu.click();
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
    await expect(navigation).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await expect(menu).toBeFocused();
    await menu.click();
    await navigation.getByRole('link', { name: 'Research', exact: true }).click();
    await expect(page).toHaveURL(/research\.html/);
    await expect(page.locator('#primary-nav a[aria-current="page"]')).toHaveText('Research');
    await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeHidden();
  });
}

test('home leads to visible research and directly to the published article', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(fresh('/'));
  await page.getByRole('link', { name: 'View research' }).click();
  await expect(page).toHaveURL(/#selected-research$/);
  const selected = page.getByRole('heading', { name: 'Selected research' });
  await expect(selected).toBeInViewport();
  const titleTop = await selected.evaluate(el => el.getBoundingClientRect().top);
  const headerBottom = await page.locator('.site-header').evaluate(el => el.getBoundingClientRect().bottom);
  expect(titleTop).toBeGreaterThanOrEqual(headerBottom);
  await expect(page.getByRole('link', { name: 'Read the article' })).toHaveAttribute('href', 'https://doi.org/10.3390/educsci16010005');
});

test('desktop navigation and current research are readily available', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(fresh('/research.html'));
  await expect(page.getByRole('button', { name: /Menu/ })).toBeHidden();
  await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible();
  await page.getByRole('navigation', { name: 'Research projects' }).getByRole('link', { name: 'Service timing' }).click();
  await expect(page.getByRole('heading', { name: 'Who Gets Help First?' })).toBeInViewport();
  await expect(page.locator('footer').getByRole('link', { name: 'Research methods' })).toHaveAttribute('href', 'methods.html');
});

test('navigation remains available without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 740 } });
  const page = await context.newPage();
  await page.goto(new URL(fresh('/'), baseURL).href);
  await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link', { name: 'CV', exact: true })).toBeVisible();
  await context.close();
});
