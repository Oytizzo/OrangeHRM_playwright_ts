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
    // Narrowed down to element that ONLY contains exact Admin heading
    await expect(this.page.locator('h6.oxd-topbar-header-breadcrumb-module')).toHaveText('Admin');
  }

  async searchUser(username: string) {
    // Use XPath to locate the Username input field
    const usernameInput = this.page.locator(`xpath=//label[text()='Username']/parent::div/following-sibling::div/input`);
    await usernameInput.fill(username);

    // Use XPath to click the Search button
    const searchButton = this.page.locator(`xpath=//button[text()=' Search ']`);
    await searchButton.click();

    await this.page.waitForSelector('.oxd-table-body', { state: 'visible', timeout: 10000 });

    // Find cell with header "Username" and corresponding data
    const userCell = this.page.locator(`xpath=//div[@class='oxd-table-cell oxd-padding-cell'][2]/div`);
    await expect(userCell).toHaveText(username);
  }
}
