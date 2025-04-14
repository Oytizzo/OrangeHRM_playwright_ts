import { Page, Locator, expect } from '@playwright/test';
import { LoginLocators } from '../locators/LoginLocators';
import { clickElement, enterText } from '../../utils/commonActions';

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('https://opensource-demo.orangehrmlive.com/');
  }

  async enterUsername(username: string) {
    await enterText(this.page, LoginLocators.usernameInput, username);
  }

  async enterPassword(password: string) {
    await enterText(this.page, LoginLocators.passwordInput, password);
  }

  async clickLogin() {
    await clickElement(this.page, LoginLocators.loginBtn);
  }

  async login(username: string, password: string) {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLogin();
  }

  async getErrorMessage() {
    return this.page.locator('.oxd-alert-content-text');
  }

  async assertDashboardLoaded() {
    await expect(this.page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  }
}