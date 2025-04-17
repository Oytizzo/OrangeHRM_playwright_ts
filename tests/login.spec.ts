import { expect } from '@playwright/test';
import { test } from '../fixtures/testSetup';

test.describe('Login Tests', () => {

  test('Valid login @smoke', async ({ loginPage, page, creds }) => {
    await test.step('Navigate to login page', async () => {
      await loginPage.goto();
    });

    await test.step('Perform login', async () => {
      await loginPage.login(creds.username, creds.password);
    });

    await test.step('Verify redirection to dashboard', async () => {
      await expect(page).toHaveURL(/dashboard/);
    });
  });

  test('Invalid login with wrong password @negative', async ({ loginPage, creds }) => {
    await loginPage.goto();
    await loginPage.login(creds.username, 'wrongPass');

    await test.step('Verify error message appears', async () => {
      const error = await loginPage.getErrorMessage();
      await expect(error).toContainText('Invalid credentials');
    });
  });

  test('Invalid login with empty credentials @validation', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.clickLogin();

    await test.step('Verify required field error shows', async () => {
      const errors = await loginPage.getRequiredError();
      await expect(errors).toHaveCount(2);
    });
  });

});
