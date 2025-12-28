import { expect, test } from '@playwright/test';

test.describe('Degree planning calculator', () => {
  test('updates totals when selecting a pace', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Select 3 credits per term').click();
    await expect(page.getByText('10 semesters')).toBeVisible();
  });

  test('switches programs and updates the plan', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'OMSA' }).click();
    await page.getByRole('button', { name: 'Update My Plan' }).click();
    await expect(page.getByRole('heading', { name: /Your OMSA Plan/i })).toBeVisible();
  });

  test('shows mixed load timeline', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /mixed load/i }).click();
    await expect(page.getByText('Calendar timeline')).toBeVisible();
    await expect(page.getByText(/credits ·/i).first()).toBeVisible();
  });

  test('keeps a single mobile share button in the sticky bar', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    const visibleShareButtons = page.locator('button:visible', { hasText: 'Copy share link' });
    await expect(visibleShareButtons).toHaveCount(1);

    const totalCost = page.getByText('Total cost').locator('..').locator('p').nth(1);
    const totalBox = await totalCost.boundingBox();
    const copyBox = await visibleShareButtons.first().boundingBox();

    expect(totalBox).not.toBeNull();
    expect(copyBox).not.toBeNull();

    if (totalBox && copyBox) {
      expect(totalBox.x + totalBox.width).toBeLessThanOrEqual(copyBox.x - 4);
    }
  });
});
