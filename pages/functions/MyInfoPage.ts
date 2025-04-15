import { Page, expect, test } from '@playwright/test';
import { MyInfoLocators } from '../locators/MyInfoLocators';
import { clickElement } from '../../utils/commonActions';

export class MyInfoPage {
  constructor(private page: Page) {}

  async openMyInfoPage() {
    await test.step('Navigate to My Info page', async () => {
      try {
        await clickElement(this.page, MyInfoLocators.myInfoLink);
      } catch (error) {
        console.error('Failed to navigate to My Info page:', error);
        throw error;
      }
    });
  }

  async verifyPersonalDetailsVisible() {
    await test.step('Verify "Personal Details" heading is visible', async () => {
      try {
        await expect(this.page.getByRole('heading', { name: 'Personal Details' })).toBeVisible();
      } catch (error) {
        console.error('"Personal Details" heading not visible:', error);
        throw error;
      }
    });
  }
}
