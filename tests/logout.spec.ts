import { expect } from '@playwright/test';
import { test } from '../fixtures/testSetup';

test('Logout from OrangeHRM using POM', async ({ loginPage, dashboardPage, page, creds }) => {
  await test.step('Log in to the application', async () => {
    await loginPage.goto();
    await loginPage.loginWithValidCredentials(creds.username, creds.password);
  });

  await test.step('Verify Dashboard is loaded and perform logout', async () => {
    await dashboardPage.verifyOnDashboard();
    await dashboardPage.logout();
  });

  await test.step('Verify redirection to login page after logout', async () => {
    await expect(page).toHaveURL(/auth\/login/);
  });
});
