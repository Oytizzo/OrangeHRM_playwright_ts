import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

test('Logout from OrangeHRM using POM', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const dashboard = new DashboardPage(page);

  await loginPage.goto();
  await loginPage.login('Admin', 'admin123');

  await dashboard.verifyOnDashboard();
  await dashboard.logout();

  await expect(page).toHaveURL(/auth\/login/);
});
