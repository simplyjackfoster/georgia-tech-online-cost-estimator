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
});
