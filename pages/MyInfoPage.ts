import { Page, expect } from '@playwright/test';

export class MyInfoPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async openMyInfoPage() {
    await this.page.getByRole('link', { name: 'My Info' }).click();
  }

  async verifyPersonalDetailsVisible() {
    await expect(this.page.getByRole('heading', { name: 'Personal Details' })).toBeVisible();
  }
}
