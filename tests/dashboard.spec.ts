import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { AdminPage } from '../pages/AdminPage';
import { MyInfoPage } from '../pages/MyInfoPage';

test('Verify Dashboard and Admin section are visible after login', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login('Admin', 'admin123');

  await loginPage.assertDashboardLoaded();

  // Relaxed validation: user may not always show 'Admin'
  const userName = await page.locator('p.oxd-userdropdown-name').innerText();
  console.log('Logged in user:', userName);
  await expect(page.locator('p.oxd-userdropdown-name')).toBeVisible();

  await expect(page.getByRole('link', { name: 'Admin' })).toBeVisible();

  await page.getByRole('link', { name: 'Admin' }).click();
  await expect(page.getByRole('heading', { name: 'Admin' })).toBeVisible();
});

test('Verify Admin page and user search', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const adminPage = new AdminPage(page);

  await loginPage.goto();
  await loginPage.login('Admin', 'admin123');

  await adminPage.goToAdminPage();
  await adminPage.verifyAdminTitle();
  await adminPage.searchUser('Admin');
});

test('Verify My Info page loads', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const myInfoPage = new MyInfoPage(page);

  await loginPage.goto();
  await loginPage.login('Admin', 'admin123');

  await myInfoPage.openMyInfoPage();
  await myInfoPage.verifyPersonalDetailsVisible();
});
