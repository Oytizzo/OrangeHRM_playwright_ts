import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

// test.describe('Login Scenarios', () => {
test('Valid login', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('Admin', 'admin123');

    await expect(page).toHaveURL(/dashboard/);
});

test('Invalid login with wrong password', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('Admin', 'wrongpass');

    const errorMsg = await loginPage.getErrorMessage();
    await expect(errorMsg).toContainText('Invalid credentials');
});

test('Invalid login with empty credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.clickLogin();

    const userError = page.locator('span:has-text("Required")');
    await expect(userError).toHaveCount(2); // For both username and password
});
// });