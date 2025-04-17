import { expect } from '@playwright/test';
import { test } from '../fixtures/testSetup';

test('Verify Dashboard and Admin section are visible after login', async ({ loginPage, dashboardPage, page, creds }) => {
  await test.step('Go to login page and log in', async () => {
    await loginPage.goto();
    await loginPage.login(creds.username, creds.password);
  });

  await test.step('Verify Dashboard is loaded', async () => {
    await dashboardPage.verifyOnDashboard();
    await expect(page.locator('p.oxd-userdropdown-name')).toBeVisible();
  });

  await test.step('Verify Admin section is visible and accessible', async () => {
    await expect(page.getByRole('link', { name: 'Admin' })).toBeVisible();
    await page.getByRole('link', { name: 'Admin' }).click();
    await expect(page.getByRole('heading', { name: 'Admin' })).toBeVisible();
  });

  await test.step('Log logged-in user name', async () => {
    const userName = await page.locator('p.oxd-userdropdown-name').innerText();
    console.log('✅ Logged in user:', userName);
  });
});

test('Verify Admin page and user search', async ({ loginPage, adminPage, creds }) => {
  await test.step('Log in to the application', async () => {
    await loginPage.goto();
    await loginPage.login(creds.username, creds.password);
  });

  await test.step('Navigate to Admin page and verify title', async () => {
    await adminPage.goToAdminPage();
    await adminPage.verifyAdminTitle();
  });

  await test.step('Search for a user', async () => {
    await adminPage.searchUser('Admin');
  });
});

test('Verify My Info page loads', async ({ loginPage, myInfoPage, creds }) => {
  await test.step('Log in and navigate to My Info page', async () => {
    await loginPage.goto();
    await loginPage.login(creds.username, creds.password);
    await myInfoPage.openMyInfoPage();
  });

  await test.step('Verify Personal Details section is visible', async () => {
    await myInfoPage.verifyPersonalDetailsVisible();
  });
});
