import { Page, expect, test } from '@playwright/test';
import { AdminLocators } from '../locators/AdminLocators';
import { clickElement, enterText } from '../../utils/commonActions';

export class AdminPage {
  constructor(private page: Page) {}

  async goToAdminPage() {
    await test.step('Navigate to Admin tab', async () => {
      await clickElement(this.page, AdminLocators.adminTab);
    });
  }

  async verifyAdminTitle() {
    await test.step('Verify Admin Page title', async () => {
      await expect(this.page.locator(AdminLocators.adminTitle)).toHaveText('Admin');
    });
  }

  async searchUser(username: string) {
    await test.step(`Search for user: ${username}`, async () => {
      await enterText(this.page, AdminLocators.usernameInput, username);
      await clickElement(this.page, AdminLocators.searchBtn);

      await this.page.waitForSelector('.oxd-table-body', {
        state: 'visible',
        timeout: 10000
      });

      const userCell = this.page.locator(AdminLocators.userCell);
      await expect(userCell).toHaveText(username);
    });
  }
}
