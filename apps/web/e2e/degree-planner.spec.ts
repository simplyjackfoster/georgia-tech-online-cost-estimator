import { expect, test, type Page } from '@playwright/test';

const configurator = (page: Page) => page.getByRole('region', { name: 'Start your OMS plan' });
const summary = (page: Page) => page.getByRole('region', { name: /^Your \w+ Plan$/ });
const applyPlan = (page: Page) => configurator(page).getByRole('button', { name: 'Update My Plan' }).click();
// Radios are visually hidden behind styled labels; click the label text like a user would.
const choose = (page: Page, label: string) => configurator(page).getByText(label, { exact: true }).click();

test.describe('Degree planning calculator', () => {
  test('defaults to out-of-state OMSCS', async ({ page }) => {
    await page.goto('/');

    await expect(summary(page).getByText('$9,735.00')).toBeVisible();
    await expect(summary(page).getByText(/Out-of-state rates/)).toBeVisible();
  });

  test('updates totals only after applying a pace', async ({ page }) => {
    await page.goto('/');

    await choose(page, '3 credits');
    await expect(configurator(page).getByRole('radio', { name: '3 credits' })).toBeChecked();
    await expect(summary(page).getByText('10 semesters')).toHaveCount(0);

    await applyPlan(page);
    await expect(summary(page).getByText('10 semesters')).toBeVisible();
  });

  test('switches programs and residency', async ({ page }) => {
    await page.goto('/');

    await choose(page, 'OMSA');
    await choose(page, 'In-state');
    await applyPlan(page);

    await expect(page.getByRole('heading', { name: 'Your OMSA Plan' })).toBeVisible();
    // 36 credits × $330
    await expect(summary(page).getByText('$11,880.00')).toBeVisible();
  });

  test('shows the calendar timeline for a mixed schedule', async ({ page }) => {
    await page.goto('/');

    await choose(page, 'Custom schedule (Mixed)');
    await applyPlan(page);

    await expect(page.getByText('Calendar timeline')).toBeVisible();
    await expect(summary(page).getByText(/^\d+ credits$/).first()).toBeVisible();
  });

  test('round-trips the selection through the share URL', async ({ page }) => {
    await page.goto('/?program=omscsec&residency=out-of-country&pace=9&mode=constant&start=fall-2026');

    await expect(page.getByRole('heading', { name: 'Your OMSCSEC Plan' })).toBeVisible();
    // 30 credits × $406 + 4 × $531
    await expect(summary(page).getByText('$14,304.00')).toBeVisible();
    await expect(configurator(page).getByRole('radio', { name: 'Out-of-country' })).toBeChecked();
  });

  test('keeps a single visible share button on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    const visibleShareButtons = page.locator('button:visible', { hasText: 'Copy share link' });
    await expect(visibleShareButtons).toHaveCount(1);
  });
});
