import { test, expect } from '@playwright/test';

test('engineer login → sees My Machines', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: /Alice Chen/ }).click();
  await expect(page).toHaveURL(/developer\/machines/, { timeout: 10_000 });
  await expect(page.getByRole('heading', { name: 'My Machines' })).toBeVisible();
  await expect(page.getByText('dev-machine-01').first()).toBeVisible();
});

test('admin login → sees Fleet Overview', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: /Bob Martinez/ }).click();
  await expect(page).toHaveURL(/admin\/overview/, { timeout: 10_000 });
  await expect(page.getByRole('heading', { name: 'Fleet Overview' })).toBeVisible();
  await expect(page.getByText('Running VMs').first()).toBeVisible();
});

test('admin can navigate to VM Inventory and filter', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: /Bob Martinez/ }).click();
  await expect(page).toHaveURL(/admin\/overview/, { timeout: 10_000 });
  await page.getByRole('link', { name: 'VM Inventory' }).click();
  await expect(page).toHaveURL(/admin\/inventory/);
  await page.getByLabel('Search VMs or owners').fill('charlie');
  await expect(page.getByText('charlie-dev-01').first()).toBeVisible();
  await expect(page.getByText('dev-machine-01')).not.toBeVisible();
});
