import { Page, expect } from '@playwright/test';

export class AdminPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goToAdminPage() {
    await this.page.getByRole('link', { name: 'Admin' }).click();
  }

  async verifyAdminTitle() {
    await expect(this.page.locator('h6.oxd-topbar-header-breadcrumb-module')).toHaveText('Admin');
  }

  async searchUser(username: string) {
    const usernameInput = this.page.locator(`xpath=//label[text()='Username']/parent::div/following-sibling::div/input`);
    await usernameInput.fill(username);

    const searchButton = this.page.locator(`xpath=//button[text()=' Search ']`);
    await searchButton.click();

    await this.page.waitForSelector('.oxd-table-body', { state: 'visible', timeout: 10000 });

    const userCell = this.page.locator(`xpath=//div[@class='oxd-table-cell oxd-padding-cell'][2]/div`);
    await expect(userCell).toHaveText(username);
  }
}
