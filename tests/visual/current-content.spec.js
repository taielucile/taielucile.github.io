const { test, expect } = require('@playwright/test');
const title = 'Racial and Socioeconomic Differences in Reported Developmental-Service Initiation Before Age Three';
const revision = process.env.GITHUB_SHA || 'current';

test('research and writing agree on the manuscript title and status', async ({ page }) => {
  await page.goto(`/research.html?qa=${revision}`);
  const study = page.locator('#who-gets-help');
  await expect(study.getByRole('heading')).toHaveText(title);
  await expect(study).toContainText('Under review at Maternal and Child Health Journal');
  await expect(study).toContainText('13,930 children ages 6–17');
  await page.goto(`/publications.html?qa=${revision}`);
  await expect(page.locator('#under-review')).toContainText(title);
  await expect(page.locator('#manuscripts')).not.toContainText(title);
});

test('CV has current facts in both screen and print layouts', async ({ page }) => {
  await page.goto(`/cv.html?qa=${revision}`);
  const cv = page.locator('.cv-document');
  await expect(cv).toContainText('University of California, Irvine');
  await expect(cv).toContainText('13,930');
  await expect(cv).toContainText('Declined');
  await expect(cv).toContainText('Levy-Hughes');
  await expect(cv).toContainText('every completed semester');
  await expect(page.locator('.print-master-cv')).toHaveCount(0);
  await page.emulateMedia({ media: 'print' });
  await expect(cv).toBeVisible();
  await expect(page.locator('.site-header')).toBeHidden();
  await expect(page.locator('.cv-head .actions')).toBeHidden();
  await expect(cv).toContainText(title);
  await expect(cv).toContainText('Maternal and Child Health Journal');
});
