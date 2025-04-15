import { Page, expect, test } from '@playwright/test';
import { DashboardLocators } from '../locators/DashboardLocators';
import { clickElement } from '../../utils/commonActions';

export class DashboardPage {
    constructor(private page: Page) {}

    async verifyOnDashboard() {
        await test.step('Verify Dashboard header is visible', async () => {
        await expect(this.page.locator(DashboardLocators.dashboardHeader)).toHaveText('Dashboard');
        });
    }

    async logout() {
        await test.step('Logout from application', async () => {
        await clickElement(this.page, DashboardLocators.userDropdown);
        await clickElement(this.page, DashboardLocators.logoutButton);
        });
    }
}
