import { Page, Locator, expect } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly dashboardHeader: Locator;
  readonly userDropdown: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dashboardHeader = page.locator('h6');
    this.userDropdown = page.locator('p.oxd-userdropdown-name');
    this.logoutButton = page.locator('a[href="/web/index.php/auth/logout"]');
  }

  async verifyOnDashboard() {
    await expect(this.dashboardHeader).toHaveText('Dashboard');
  }

  async logout() {
    await this.userDropdown.click();
    await this.logoutButton.click();
  }
}